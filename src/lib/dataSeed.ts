import { ObjectId } from "mongodb";

export const class_contents = [{
    "_id": new ObjectId("6870033152d040f3c17a3c1a"),
    "classId": new ObjectId("686ffe16ca5588731a8cfe2b"),
    "welcomeMessage": "Welcome to this class, we're going to learn a lot of English here, we'll have interactive activities and a lot of fun!",
    "resources": [
      {
        "id": "1752171515091",
        "description": "This is the book that we will be using during this class.",
        "link": "https://example-of-a-book-url",
        "fileName": ""
      },
      {
        "id": "1752171585169",
        "description": "These are a set of videos that we'll be taking a look during this class as well.",
        "link": "https://example-link-to-youtube",
        "fileName": ""
      },
      {
        "id": "1752171815175",
        "description": "All students must complete this assignment first",
        "link": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/classes/686ffe16ca5588731a8cfe2b/teacher/1/0397f7fa-f520-46ae-8f26-688349728252.docx",
        "fileName": "Jason's trip.docx"
      },
      {
        "id": "1752172555505",
        "description": "hola",
        "link": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/classes/686ffe16ca5588731a8cfe2b/teacher/1/a1238cfa-f21f-4550-aa0a-b8ad0a4e9a3b.png",
        "fileName": "Screenshot 2025-06-13 at 7.14.06 PM.png"
      }
    ],
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": new ObjectId("6870222dd556741036a639d3"),
    "classId": new ObjectId("686ffe613b740bd6434b25fd"),
    "welcomeMessage": "",
    "resources": [],
    "createdAt": new Date()
  }]

export const classes = [{
    "_id": new ObjectId("686ffe16ca5588731a8cfe2b"),
    "teacher_id": new ObjectId("686ffbecca5588731a8cfe2a"),
    "subject_id": new ObjectId("686edb3a380fa9ad9e0499e9"),
    "subjectName": "Inglés",
    "teacherName": "Fernando Ramirez",
    "startTime": new Date("1970-01-01T18:30:00.000Z"),
    "endTime": new Date("1970-01-01T20:30:00.000Z"),
    "selectedDays": [
      "1",
      "3",
      "5"
    ],
    "maxStudents": 30,
    "durationWeeks": 16,
    "price": 2000,
    "level": "3",
    "whatsappLink": "https://www.this-is-an-url-example-for-a-whatsapp-group.com",
    "status": "in_progress",
    "created_at": new Date(),
    "updated_at": new Date(),
    "currency": "DOP",
    "startDate": new Date()
  },
  {
    "_id": new ObjectId("686ffe613b740bd6434b25fd"),
    "teacher_id": new ObjectId("686ffbecca5588731a8cfe2a"),
    "subject_id": new ObjectId("686edb3a380fa9ad9e0499ea"),
    "subjectName": "Español",
    "teacherName": "Fernando Ramirez",
    "startTime": new Date("1970-01-01T09:00:00.000Z"),
    "endTime": new Date("1970-01-01T11:00:00.000Z"),
    "selectedDays": [
      "2",
      "4"
    ],
    "maxStudents": 30,
    "durationWeeks": 16,
    "price": 1500,
    "level": "1",
    "whatsappLink": "https://www.this-is-an-url-example-for-a-whatsapp-group.com",
    "status": "in_progress",
    "created_at": new Date(),
    "updated_at": new Date(),
    "currency": "DOP",
    "startDate": new Date()
  },
  {
    "_id": new ObjectId("686ffe743b740bd6434b25fe"),
    "teacher_id": new ObjectId("686ffbecca5588731a8cfe2a"),
    "subject_id": new ObjectId("686edb3a380fa9ad9e0499eb"),
    "subjectName": "Francés",
    "teacherName": "Fernando Ramirez",
    "startTime": new Date("1970-01-01T08:00:00.000Z"),
    "endTime": new Date("1970-01-01T12:00:00.000Z"),
    "selectedDays": [
      "6"
    ],
    "maxStudents": 30,
    "durationWeeks": 16,
    "price": 2500,
    "level": "2",
    "whatsappLink": "https://www.this-is-an-url-example-for-a-whatsapp-group.com",
    "status": "ready_to_start",
    "created_at": new Date(),
    "updated_at": new Date(),
    "currency": "DOP"
  }]
    
export const enrollments = [{
    "_id": new ObjectId("687000d03b740bd6434b25ff"),
    "student_id": new ObjectId("687000279a87bd81a728f267"),
    "class_id": new ObjectId("686ffe16ca5588731a8cfe2b"),
    "status": "enrolled",
    "paymentAmount": 2000,
    "expiresAt": new Date(new Date().setDate(new Date().getDate() + 2)),
    "createdAt": new Date(),
    "updatedAt": new Date(),
    "paymentNotes": "",
    "paymentProof": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/enrollments/79ca7a39-8a31-45fd-8cf3-551e4f2cac03.jpeg",
    "paymentSubmittedAt": new Date(),
    "billingStartDate": new Date(),
    "nextPaymentDueDate": new Date(new Date().setMonth(new Date().getMonth() + 1)),
    "paymentsMade": [
      {
        "_id": "1e13ebde-eef3-4e3d-904e-4a697e132a16",
        "amount": 2000,
        "date": new Date(),
        "status": "paid",
        "notes": "Pago inicial de inscripción",
        "paymentDueDate": new Date()
      }
    ],
    "priceAtEnrollment": 2000
  },
  {
    "_id": new ObjectId("6870030652d040f3c17a3c19"),
    "student_id": new ObjectId("687000279a87bd81a728f267"),
    "class_id": new ObjectId("686ffe613b740bd6434b25fd"),
    "status": "enrolled",
    "paymentAmount": 1500,
    "expiresAt": new Date(new Date().setDate(new Date().getDate() + 2)),
    "createdAt": new Date(),
    "updatedAt": new Date(),
    "paymentNotes": "",
    "paymentProof": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/enrollments/26840283-b1e9-435f-8c14-78f722c7c114.jpeg",
    "paymentSubmittedAt": new Date(),
    "billingStartDate": new Date(),
    "nextPaymentDueDate": new Date(new Date().setMonth(new Date().getMonth() + 1)),
    "paymentsMade": [
      {
        "_id": "a2582413-7538-4307-aab1-bdfaff7f9e42",
        "amount": 1500,
        "date": new Date(),
        "status": "paid",
        "notes": "Pago inicial de inscripción",
        "paymentDueDate": new Date()
      }
    ],
    "priceAtEnrollment": 1500
  }]

export const users = [{
    "_id": new ObjectId("686ffbecca5588731a8cfe2a"),
    "username": "Fernando Ramirez",
    "password": "$2b$10$ylavPlPSXaK2eCYMV/aKoO79rrm0WjpJ4e4KOmgGrgjUbzZpnxG.i",
    "user_is_student": false,
    "user_is_teacher": true,
    "email": "teacher@gmail.com",
    "status": "A",
    "country": "US",
    "image_path": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/profile-pictures/686ffbecca5588731a8cfe2a/880f77e7-a216-427a-b68e-839dd309f4f5.jpg",
    "description": "Me gusta mucho la enseñanza, quiero impulsar la vida de cada uno de mis estudiantes.",
    "number": "+12278293009",
    "data": {
      "subjects": [
        {
          "_id": "686edb3a380fa9ad9e0499ea",
          "name": "Español"
        },
        {
          "_id": "686edb3a380fa9ad9e0499e9",
          "name": "Inglés"
        },
        {
          "_id": "686edb3a380fa9ad9e0499eb",
          "name": "Francés"
        }
      ]
    },
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "_id": new ObjectId("687000279a87bd81a728f267"),
    "username": "Alex Mcgregor",
    "password": "$2b$10$3GetryQ6ZfWQc0wlfDNZYeWTfWUtGkv/WT9KkLXnPrwuqUVVFbyVq",
    "user_is_student": true,
    "user_is_teacher": false,
    "email": "student@gmail.com",
    "status": "A",
    "country": "DO",
    "image_path": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/profile-pictures/687000279a87bd81a728f267/15e5e619-8e9b-4091-8cdf-8e719cd8c4d8.jpg",
    "description": "Me encanta aprender idiomas, espero aprender mucho y practicar con varias personas.",
    "number": "+18297749890",
    "data": {},
    "created_at": new Date(),
    "updated_at": new Date()
  },
  {
    "_id": new ObjectId("6870014252d040f3c17a3c18"),
    "username": "Administrator",
    "password": "$2b$10$l.Yx8fMQuwLgeVOb80R1xORaD5V3XdTRPqF.b3pQNExZjfbCM1u3a",
    "user_is_student": true,
    "user_is_teacher": true,
    "email": "admin@gmail.com",
    "status": "A",
    "country": "GB",
    "image_path": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/profile-pictures/6870014252d040f3c17a3c18/736dbf0c-9350-4ae2-8d92-78dde2727c6a.png",
    "description": "Hi, I'm the admin, I love taking care of the operaitons of this app. I can be a teacher and a student, but my role here is to accept enrollments / payments and pay the other teacher.",
    "number": "+443499230200",
    "data": {},
    "created_at": new Date(),
    "updated_at": new Date(),
    "role": "admin"
  }]

export const weeks = [{
    "_id": new ObjectId("68700718f431a0fd3da0da43"),
    "classId": new ObjectId("686ffe16ca5588731a8cfe2b"),
    "weekNumber": 1,
    "meetingLink": "https://www.example-link-to-a-virtual-meeting-for-this-week.com",
    "recordingLink": "https://www.example-link-to-a-virtual-recorded-meeting-for-this-week.com",
    "supportMaterials": [
      {
        "id": "1752172345866",
        "description": "You have to see this video first to understand the assignment",
        "link": "https://youtube.com",
        "fileName": "youtube.com"
      }
    ],
    "assignment": {
      "dueDate": new Date(new Date().setDate(new Date().getDate() + 7)),
      "description": "This is a description of the first assignment for this class, you got to follow it in order to get a good grade, please note that you got to send the assignment and an audio voice explaining what you just did, so i can test your pronunciation in English as well.",
      "hasAudio": true,
      "fileLink": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/classes/686ffe16ca5588731a8cfe2b/teacher/1/a33acdd2-e9d3-421d-9a02-947e97a53ede.pdf",
      "fileName": "EF SET Certificate.pdf"
    },
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": new ObjectId("6870225cd556741036a639d4"),
    "classId": new ObjectId("686ffe16ca5588731a8cfe2b"),
    "weekNumber": 2,
    "meetingLink": "https://www.example-link-to-a-virtual-meeting-for-this-week.com",
    "recordingLink": "https://www.example-link-to-a-virtual-meeting-for-this-week.com",
    "supportMaterials": [],
    "assignment": {
      "dueDate": new Date(new Date().setDate(new Date().getDate() + 7)),
      "description": "Well, this is another description for the other assignment of week 2",
      "hasAudio": true,
      "fileLink": "",
      "fileName": ""
    },
    "createdAt": new Date(),
    "updatedAt": new Date()
  }]

export const submittedAssignments = [{
  "_id": new ObjectId("68703842f5f23b7f2222bae6"),
  "classId": new ObjectId("686ffe16ca5588731a8cfe2b"),
  "studentId": new ObjectId("687000279a87bd81a728f267"),
  "weekNumber": 1,
  "fileUrl": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/classes/686ffe16ca5588731a8cfe2b/student/1/e770dab5-024a-4c6b-b3a8-c743a04a524b.docx",
  "audioUrl": "https://testclassnetbucket.s3.us-east-2.amazonaws.com/classes/686ffe16ca5588731a8cfe2b/student/1/bd8336b8-a3f4-444e-8a86-3d7d6bd56972.mp3",
  "fileName": "Jason's trip.docx",
  "message": "I Hope I get the maximun grade possible.",
  "updatedAt": new Date(),
  "submittedAt": new Date(),
  "fileGrade": 90,
  "fileFeedback": "Good story, would like me to fill the answers?",
  "audioGrade": 85,
  "audioFeedback": "Ok, good job, It sounds a little low though.",
  "isGraded": true,
  "overallGrade": 90,
  "overallFeedback": "In general, that was a good assignment, keep up the good work!",
  "gradedAt": new Date(),
  "gradedBy": new ObjectId("686ffbecca5588731a8cfe2a")
}]