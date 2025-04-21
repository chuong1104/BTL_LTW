// File Upload Service - Handles file uploads to the server
class FileUploadService {
    constructor() {
      this.baseUrl = "http://localhost:8080/api"
    }
  
    // Upload a single file
    async uploadFile(file, endpoint = "/upload") {
      try {
        const formData = new FormData()
        formData.append("file", file)
  
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          body: formData,
          credentials: "include", // Para enviar cookies de autenticação
        })
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }
  
        const data = await response.json()
        return { success: true, data }
      } catch (error) {
        console.error("File upload failed:", error)
        return { success: false, message: error.message }
      }
    }
  
    // Upload multiple files
    async uploadMultipleFiles(files, endpoint = "/upload/multiple") {
      try {
        const formData = new FormData()
  
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i])
        }
  
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          body: formData,
          credentials: "include",
        })
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }
  
        const data = await response.json()
        return { success: true, data }
      } catch (error) {
        console.error("Multiple file upload failed:", error)
        return { success: false, message: error.message }
      }
    }
  
    // Create a file reader promise
    readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
  
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error("Failed to read file"))
  
        reader.readAsDataURL(file)
      })
    }
  
    // Create a file reader promise for text files
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
  
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error("Failed to read file"))
  
        reader.readAsText(file)
      })
    }
  }
  
  // Export a singleton instance
  export const fileUploadService = new FileUploadService()
  