use pc_build_sim::router::dispatch_request;
use std::env;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::process;
use std::thread;

use std::time::Duration;

fn parse_content_length(headers: &str) -> usize {
    for line in headers.lines() {
        if let Some((name, value)) = line.split_once(':') {
            if name.trim().eq_ignore_ascii_case("Content-Length") {
                if let Ok(len) = value.trim().parse::<usize>() {
                    return len.min(65536);
                }
            }
        }
    }
    0
}

fn handle_client(mut stream: TcpStream) {
    let _ = stream.set_read_timeout(Some(Duration::from_secs(2)));
    let mut raw_buf = Vec::with_capacity(4096);
    let mut chunk = [0u8; 4096];

    loop {
        match stream.read(&mut chunk) {
            Ok(0) => break,
            Ok(n) => {
                raw_buf.extend_from_slice(&chunk[..n]);
                let raw_str = String::from_utf8_lossy(&raw_buf);
                if let Some((sep_pos, sep_len)) = raw_str
                    .find("\r\n\r\n")
                    .map(|p| (p, 4))
                    .or_else(|| raw_str.find("\n\n").map(|p| (p, 2)))
                {
                    let content_len = parse_content_length(&raw_str[..sep_pos]);
                    if raw_buf.len() >= sep_pos + sep_len + content_len {
                        break;
                    }
                }
                if raw_buf.len() >= 65536 {
                    break;
                }
            }
            Err(_) => break,
        }
    }

    if raw_buf.is_empty() {
        return;
    }

    let raw_req = String::from_utf8_lossy(&raw_buf);
    let mut lines = raw_req.split("\r\n");
    let req_line = lines.next().unwrap_or("");
    let parts: Vec<&str> = req_line.split_whitespace().collect();

    let method = if !parts.is_empty() { parts[0] } else { "GET" };
    let path = if parts.len() > 1 { parts[1] } else { "/" };

    let body = if let Some(pos) = raw_req.find("\r\n\r\n") {
        &raw_req[pos + 4..]
    } else if let Some(pos) = raw_req.find("\n\n") {
        &raw_req[pos + 2..]
    } else {
        ""
    };

    let res = dispatch_request(method, path, body);

    let status_text = match res.status_code {
        200 => "OK",
        404 => "Not Found",
        500 => "Internal Server Error",
        _ => "Unknown",
    };

    let response_header = format!(
        "HTTP/1.1 {} {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nCache-Control: no-cache, no-store, must-revalidate\r\nPragma: no-cache\r\nExpires: 0\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nConnection: close\r\n\r\n",
        res.status_code,
        status_text,
        res.content_type,
        res.body.as_bytes().len()
    );

    let _ = stream.write_all(response_header.as_bytes());
    let _ = stream.write_all(res.body.as_bytes());
    let _ = stream.flush();
}

fn main() {
    let args: Vec<String> = env::args().collect();

    // Check for --help
    if args.contains(&"--help".to_string()) || args.contains(&"-h".to_string()) {
        println!("PC Building Simulator & Test Bench Server [Rust + TypeScript]");
        println!("Usage: pc_build_sim [OPTIONS]");
        println!("Options:");
        println!("  --port <PORT>   Port to listen on (default: 8080)");
        println!("  --help, -h      Display this help message");
        return;
    }

    let mut port = 8080;
    for i in 0..args.len() {
        if args[i] == "--port" && i + 1 < args.len() {
            if let Ok(p) = args[i + 1].parse::<u16>() {
                port = p;
            }
        }
    }

    let addr = format!("127.0.0.1:{}", port);
    let listener = match TcpListener::bind(&addr) {
        Ok(l) => l,
        Err(e) => {
            eprintln!("Failed to bind to {}: {}", addr, e);
            process::exit(1);
        }
    };

    println!("============================================================");
    println!("PC Building Simulator & Virtual Test Bench Daemon [Rust Core]");
    println!("Server running on http://{}", addr);
    println!("Spatial 3D Workstation: http://{}/", addr);
    println!("REST API Endpoints: /api/components, /api/verify, /api/power, /api/benchmark");
    println!("============================================================");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(move || {
                    handle_client(stream);
                });
            }
            Err(e) => {
                eprintln!("Incoming connection error: {}", e);
            }
        }
    }
}
