"use client";

import { FileUploader, AudioRecorder, Modal } from "@/components";
import { useState } from "react";

export default function TeacherDashboard() {
    const [showAudioModal, setShowAudioModal] = useState(false);
    
    return (
        <div className="min-h-screen p-4 space-y-4">
            <FileUploader />
            
            <button 
                onClick={() => setShowAudioModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Grabar Audio
            </button>
            
            <Modal 
                isOpen={showAudioModal} 
                onClose={() => setShowAudioModal(false)}
                title="Grabador de Audio"
            >
                <AudioRecorder />
            </Modal>
        </div>
    );
}