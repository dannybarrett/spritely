use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Manager, State};

#[derive(Default)]
struct AppState {
    sprites: Vec<Sprite>,
}



#[derive(Copy, Clone, Serialize, Deserialize)]
struct Pixel {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

impl Pixel {
    pub fn transparent() -> Self {
        Pixel {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        }
    }

    pub fn from_hex(hex: &str) -> Self {
        let hex = hex.trim_start_matches('#');
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(0);
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(0);
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(0);
        let a = if hex.len() > 6 {
            u8::from_str_radix(&hex[6..8], 16).unwrap_or(255)
        } else {
            255
        };
        Pixel { r, g, b, a }
    }
}

#[derive(Clone, Serialize, Deserialize)]
struct Frame {
    width: u32,
    height: u32,
    pixels: Vec<Pixel>,
}

#[derive(Clone, Serialize, Deserialize)]
struct Layer {
    frames: Vec<Frame>,
}

#[derive(Clone, Serialize, Deserialize)]
struct Sprite {
    name: String,
    layers: Vec<Layer>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn create_sprite(width: u32, height: u32, state: State<'_, Mutex<AppState>>) -> Sprite {
    let frame = Frame {
        width,
        height,
        pixels: vec![Pixel::transparent(); (width * height) as usize],
    };

    // let state = app.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();

    let new_sprite = Sprite {
        name: String::from("untitled"),
        layers: vec![Layer { frames: vec![frame.clone()] }]
    };

    state.sprites.push(new_sprite.clone());

    new_sprite
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize the app state
            app.manage(Mutex::new(AppState::default()));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, create_sprite])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
