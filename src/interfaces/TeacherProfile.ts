export interface TeacherProfileProps {
    name: string;
    email: string;
    image: string;
    description: string;
    subjects: Array<{ category: string; code: string }>;
}