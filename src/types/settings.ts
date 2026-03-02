export interface ApplicationVersion {
    version: number
    force: boolean
    applink: string
    updateDate: string
    updateMessage: string
}

export interface ApplicationSettings {
    customer: {
        ios: ApplicationVersion
        android: ApplicationVersion
    }
}

export interface Settings {
    _id: string
    application: ApplicationSettings
}

export interface SettingsResponse {
    success: boolean
    message: string
    data: Settings
}

export interface UpdateSettingsData {
    application: ApplicationSettings
}
