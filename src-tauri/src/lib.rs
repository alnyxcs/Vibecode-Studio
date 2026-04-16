mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Folder {
                        path: std::path::PathBuf::from("."),
                        file_name: Some("vibecode-studio".to_string()),
                    },
                ))
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::save_settings,
            commands::load_settings,
            commands::save_skill,
            commands::delete_skill,
            commands::load_skills,
            commands::save_subagent,
            commands::delete_subagent,
            commands::load_subagents
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
