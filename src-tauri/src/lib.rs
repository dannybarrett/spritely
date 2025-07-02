use std::fs;
use std::fs::File;
use std::io::Write;
use image::{ImageBuffer, ImageFormat};
use serde::{Serialize, Deserialize};
use serde_json;
use std::path::Path;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Pixel {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

#[tauri::command]
fn save(path: &str, sprite: &str) -> Result<String, String> {
    let mut file =
        File::create(&path).map_err(|e| format!("Failed to create file at {}: {}", path, e))?;

    file.write_all(sprite.as_bytes())
        .map_err(|e| format!("Failed to write to file {}: {}", path, e))?;

    Ok("success".to_string())
}

#[tauri::command]
fn open(path: &str) -> Result<String, String> {
    let json_string = fs::read_to_string(&path).map_err(|e| format!("Error: {}", e))?;

    Ok(json_string)
}

#[tauri::command]
fn export(path: &str, width: u32, height: u32, json: &str) -> Result<String, String> {
    let pixels: Vec<Pixel> = serde_json::from_str(&json).map_err(|e| format!("Failed to parse JSON pixel data: {}", e))?;

    let mut image_data: Vec<u8> = Vec::with_capacity((width * height * 4) as usize);
    for pixel in pixels {
        image_data.push(pixel.r);
        image_data.push(pixel.g);
        image_data.push(pixel.b);
        image_data.push(pixel.a);
    }
    let img_buffer: ImageBuffer<image::Rgba<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, image_data).ok_or("Failed to create image buffer from raw data".to_string())?;

    let output_path = Path::new(&path);
    img_buffer.save_with_format(output_path, ImageFormat::Png).map_err(|e| format!("Failed to save image to {}: {}", path, e))?;

    Ok(format!("success"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save, open, export])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
