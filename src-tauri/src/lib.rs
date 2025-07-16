use image::{ImageBuffer, ImageFormat};
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;

#[tauri::command]
fn save_sprite(path: &str, sprite: &str) -> Result<String, String> {
    let mut file =
        File::create(&path).map_err(|e| format!("Failed to create file at {}: {}", path, e))?;

    file.write_all(sprite.as_bytes())
        .map_err(|e| format!("Failed to write to file {}: {}", path, e))?;

    Ok("success".to_string())
}

#[tauri::command]
fn open_sprite(path: &str) -> Result<String, String> {
    let json_string = fs::read_to_string(&path).map_err(|e| format!("Error: {}", e))?;

    Ok(json_string)
}

#[tauri::command]
async fn export_sprite(
    path: String,
    width: u32,
    height: u32,
    scale_factor: u32,
    pixels: Vec<u8>,
) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        let original_img =
            image::ImageBuffer::<image::Rgba<u8>, Vec<u8>>::from_vec(width, height, pixels)
                .ok_or_else(|| "Failed to create original image buffer from pixels".to_string())?;

        let final_img;

        if scale_factor > 1 {
            let scaled_img = image::imageops::resize(
                &original_img,
                width * scale_factor,
                height * scale_factor,
                image::imageops::FilterType::Nearest,
            );
            final_img = scaled_img;
        } else {
            final_img = original_img;
        }

        final_img
            .save(&path)
            .map_err(|e| format!("Failed to save image to {}: {}", path, e))?;

        Ok(())
    })
    .await
    .map_err(|e| format!("Blocking task failed: {}", e))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_sprite,
            open_sprite,
            export_sprite
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
