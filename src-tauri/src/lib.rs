use std::fs;
use std::fs::File;
use std::io::Write;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_sprite, open_sprite])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
