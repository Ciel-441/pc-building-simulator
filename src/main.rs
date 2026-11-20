use pc_build_sim::router::dispatch_request;
use std::env;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::process;
use std::thread;

fn handle_client(mut stream: TcpStream) {
    let mut buffer = [0u8; 8192];
    match stream.read(&mut buffer) {
        Ok(bytes_read) => {
            if bytes_read == 0 {
                return;
            }

            let raw_req = String::from_utf8_lossy(&buffer[..bytes_read]);
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
                "HTTP/1.1 {} {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nConnection: close\r\n\r\n",
                res.status_code,
                status_text,
                res.content_type,
                res.body.as_bytes().len()
            );

            let _ = stream.write_all(response_header.as_bytes());
            let _ = stream.write_all(res.body.as_bytes());
            let _ = stream.flush();
        }
        Err(e) => {
            eprintln!("Connection read error: {}", e);
        }
    }
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
