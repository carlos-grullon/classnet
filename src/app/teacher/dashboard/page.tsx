"use client";

import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { getGlobalSession } from "@/utils/GlobalSession";

export default function TeacherDashboard() {
    const session = getGlobalSession();
    return (
        <div className="min-h-screen p-4">
            <ProfilePictureUploader 
                email={session?.userEmail}
                currentImageUrl={session?.userImage}
            />
        </div>
    );
}