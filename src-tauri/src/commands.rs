use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppSettings {
    pub theme: String,
    pub locale: String,
    pub active_view: String,
    pub active_project_id: String,
    pub ai_settings: AiSettings,
    pub projects: Vec<Project>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AiSettings {
    pub mode: String,
    pub provider: String,
    pub base_url: String,
    pub model: String,
    pub temperature: f64,
    pub api_key: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: String,
    pub color: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub content: String,
    pub frontmatter: SkillFrontmatter,
    pub tags: Vec<String>,
    pub visibility: String,
    pub project_id: Option<String>,
    pub platforms: Vec<String>,
    pub updated_at: String,
    pub preferred_model: Option<String>,
    pub usage_examples: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SkillFrontmatter {
    pub model: String,
    pub temperature: f64,
    pub context: String,
    pub tools: Vec<String>,
    pub skills: Vec<String>,
    pub permissions: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Subagent {
    pub id: String,
    pub name: String,
    pub role_prompt: String,
    pub description: String,
    pub preferred_model: Option<String>,
    pub parent_id: Option<String>,
    pub allowed_tools: Vec<String>,
    pub preloaded_skill_ids: Vec<String>,
    pub usage_examples: Vec<String>,
    pub visibility: String,
    pub project_id: Option<String>,
    pub platforms: Vec<String>,
    pub context_behavior: String,
    pub updated_at: String,
}

fn get_data_dir() -> PathBuf {
    let exe_path = std::env::current_exe().unwrap_or_default();
    let exe_dir = exe_path.parent().unwrap_or(std::path::Path::new("."));
    exe_dir.join("data")
}

fn ensure_data_dir() -> Result<PathBuf, String> {
    let dir = get_data_dir();
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        log::info!("Created data directory: {:?}", dir);
    }
    Ok(dir)
}

#[tauri::command]
pub fn save_settings(data: AppSettings) -> Result<(), String> {
    log::info!("Saving settings, projects count: {}", data.projects.len());
    let dir = ensure_data_dir()?;
    let path = dir.join("settings.json");
    let json = serde_json::to_string_pretty(&data).map_err(|e| {
        log::error!("Failed to serialize settings: {}", e);
        e.to_string()
    })?;
    fs::write(&path, json).map_err(|e| {
        log::error!("Failed to write settings file: {}", e);
        e.to_string()
    })?;
    log::info!("Settings saved successfully to {:?}", path);
    Ok(())
}

#[tauri::command]
pub fn load_settings() -> Result<Option<AppSettings>, String> {
    log::info!("Loading settings");
    let dir = get_data_dir();
    let path = dir.join("settings.json");
    if !path.exists() {
        log::info!("Settings file not found, returning None");
        return Ok(None);
    }
    let json = fs::read_to_string(&path).map_err(|e| {
        log::error!("Failed to read settings file: {}", e);
        e.to_string()
    })?;
    let data: AppSettings = serde_json::from_str(&json).map_err(|e| {
        log::error!("Failed to deserialize settings: {}", e);
        e.to_string()
    })?;
    log::info!(
        "Settings loaded successfully, projects: {}",
        data.projects.len()
    );
    Ok(Some(data))
}

#[tauri::command]
pub fn save_skill(skill: Skill) -> Result<(), String> {
    log::info!("Saving skill: {} (id: {})", skill.name, skill.id);
    let dir = ensure_data_dir()?;
    let skill_id = if skill.id.starts_with("skill_") {
        skill.id.clone()
    } else {
        format!("skill_{}", skill.id)
    };
    let path = dir.join(format!("{}.json", skill_id));
    let json = serde_json::to_string_pretty(&skill).map_err(|e| {
        log::error!("Failed to serialize skill {}: {}", skill.id, e);
        e.to_string()
    })?;
    fs::write(&path, json).map_err(|e| {
        log::error!("Failed to write skill file {}: {}", skill.id, e);
        e.to_string()
    })?;
    log::info!("Skill saved: {} to {:?}", skill.name, path);
    Ok(())
}

#[tauri::command]
pub fn delete_skill(skill_id: String) -> Result<(), String> {
    log::info!("Deleting skill: {}", skill_id);
    let dir = get_data_dir();
    let filename = if skill_id.starts_with("skill_") {
        format!("{}.json", skill_id)
    } else {
        format!("skill_{}.json", skill_id)
    };
    let path = dir.join(filename);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| {
            log::error!("Failed to delete skill {}: {}", skill_id, e);
            e.to_string()
        })?;
        log::info!("Skill deleted: {}", skill_id);
    }
    Ok(())
}

#[tauri::command]
pub fn load_skills() -> Result<Vec<Skill>, String> {
    log::info!("Loading skills");
    let dir = get_data_dir();
    let mut skills = Vec::new();

    if !dir.exists() {
        log::info!("Data directory does not exist, returning empty skills");
        return Ok(skills);
    }

    for entry in fs::read_dir(&dir).map_err(|e| {
        log::error!("Failed to read data directory: {}", e);
        e.to_string()
    })? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if let Some(name) = path.file_name() {
            let name_str = name.to_string_lossy();
            let is_skill_file = name_str.starts_with("skill_") && name_str.ends_with(".json");
            if is_skill_file {
                let json = fs::read_to_string(&path).map_err(|e| {
                    log::error!("Failed to read skill file: {}", e);
                    e.to_string()
                })?;
                let skill: Skill = serde_json::from_str(&json).map_err(|e| {
                    log::error!("Failed to deserialize skill: {}", e);
                    e.to_string()
                })?;
                skills.push(skill);
            }
        }
    }

    log::info!("Loaded {} skills", skills.len());
    Ok(skills)
}

#[tauri::command]
pub fn save_subagent(subagent: Subagent) -> Result<(), String> {
    log::info!("Saving subagent: {} (id: {})", subagent.name, subagent.id);
    let dir = ensure_data_dir()?;
    let agent_id = if subagent.id.starts_with("agent_") {
        subagent.id.clone()
    } else {
        format!("agent_{}", subagent.id)
    };
    let path = dir.join(format!("{}.json", agent_id));
    let json = serde_json::to_string_pretty(&subagent).map_err(|e| {
        log::error!("Failed to serialize subagent {}: {}", subagent.id, e);
        e.to_string()
    })?;
    fs::write(&path, json).map_err(|e| {
        log::error!("Failed to write subagent file {}: {}", subagent.id, e);
        e.to_string()
    })?;
    log::info!("Subagent saved: {} to {:?}", subagent.name, path);
    Ok(())
}

#[tauri::command]
pub fn delete_subagent(subagent_id: String) -> Result<(), String> {
    log::info!("Deleting subagent: {}", subagent_id);
    let dir = get_data_dir();
    let filename = if subagent_id.starts_with("agent_") {
        format!("{}.json", subagent_id)
    } else {
        format!("agent_{}.json", subagent_id)
    };
    let path = dir.join(filename);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| {
            log::error!("Failed to delete subagent {}: {}", subagent_id, e);
            e.to_string()
        })?;
        log::info!("Subagent deleted: {}", subagent_id);
    }
    Ok(())
}

#[tauri::command]
pub fn load_subagents() -> Result<Vec<Subagent>, String> {
    log::info!("Loading subagents");
    let dir = get_data_dir();
    let mut subagents = Vec::new();

    if !dir.exists() {
        log::info!("Data directory does not exist, returning empty subagents");
        return Ok(subagents);
    }

    for entry in fs::read_dir(&dir).map_err(|e| {
        log::error!("Failed to read data directory: {}", e);
        e.to_string()
    })? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if let Some(name) = path.file_name() {
            let name_str = name.to_string_lossy();
            let is_agent_file = name_str.starts_with("agent_") && name_str.ends_with(".json");
            if is_agent_file {
                let json = fs::read_to_string(&path).map_err(|e| {
                    log::error!("Failed to read subagent file: {}", e);
                    e.to_string()
                })?;
                let subagent: Subagent = serde_json::from_str(&json).map_err(|e| {
                    log::error!("Failed to deserialize subagent: {}", e);
                    e.to_string()
                })?;
                subagents.push(subagent);
            }
        }
    }

    log::info!("Loaded {} subagents", subagents.len());
    Ok(subagents)
}
