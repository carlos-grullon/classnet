"use client"

import { useState, useCallback } from "react"
import { Button, ThemeToggle, Modal, Card } from "@/components"
import { ErrorMsj } from "@/utils/Tools.tsx"
import { FiBookOpen, FiStar, FiCheckCircle, FiArrowLeft } from "react-icons/fi"

export interface Question {
    id: number
    question: string
    options: string[]
    correctAnswer: number
    difficulty: "basic" | "intermediate" | "advanced"
    explanation?: string
}

const questions: Question[] = [
    {
        id: 1,
        question: "What’s the correct translation for: 'Tengo un perro'?",
        options: ["I have a dog", "I has a dog", "I am have a dog", "I got dog"],
        correctAnswer: 0,
        difficulty: "basic",
    },
    {
        id: 2,
        question: "Choose the correct form: 'She ____ a teacher.'",
        options: ["are", "is", "am", "be"],
        correctAnswer: 1,
        difficulty: "basic",
    },
    {
        id: 3,
        question: "What’s the opposite of 'cold'?",
        options: ["Hot", "Cool", "Warm", "Wet"],
        correctAnswer: 0,
        difficulty: "basic",
    },
    {
        id: 4,
        question: "What is the plural of 'child'?",
        options: ["childs", "childes", "children", "childrens"],
        correctAnswer: 2,
        difficulty: "basic",
    },
    {
        id: 5,
        question: "Complete the sentence: 'I usually ____ coffee in the morning.'",
        options: ["drinks", "drink", "drinking", "drunk"],
        correctAnswer: 1,
        difficulty: "basic",
    },
    {
        id: 6,
        question: "Which question is correct?",
        options: [
            "Where you live?",
            "Where do you live?",
            "Where are you live?",
            "Where does you live?",
        ],
        correctAnswer: 1,
        difficulty: "basic",
    },
    {
        id: 7,
        question: "Complete: 'He ____ to the gym every day.'",
        options: ["go", "goes", "going", "gone"],
        correctAnswer: 1,
        difficulty: "basic",
    },
    {
        id: 8,
        question: "What's the sentence for: 'Ella fue a la escuela'?:",
        options: [
            "She goes to school.",
            "She went to school.",
            "She go to school.",
            "She can go to school.",
        ],
        correctAnswer: 1,
        difficulty: "basic",
    },
    {
        id: 9,
        question: "What tense is this: 'I have lived here for 5 years.'?",
        options: ["Past simple", "Present perfect", "Present simple", "Past perfect"],
        correctAnswer: 1,
        difficulty: "intermediate",
    },
    {
        id: 10,
        question: "What's the correct invitation?",
        options: [
            "Do you want going to the party?",
            "Do you want go to the party?",
            "Do you want to go to the party?",
            "Do you want to leave the party?",
        ],
        correctAnswer: 2,
        difficulty: "intermediate",
    },
    {
        id: 11,
        question: "What’s the present continuous tense for?",
        options: [
            "To describe something that passed.",
            "To describe something that is happening now.",
            "To describe something that is going to happen.",
            "To describe something that you do every day.",
        ],
        correctAnswer: 1,
        difficulty: "intermediate",
    },
    {
        id: 12,
        question: "Answer correctly: How often do you exercise?",
        options: [
            "Yes, I used to exercise every day.",
            "No, I don't exercise.",
            "I exercise five times a week.",
            "I eat healthy food.",
        ],
        correctAnswer: 2,
        difficulty: "intermediate",
    },
    {
        id: 13,
        question: "Answer correctly: Why was he tired last week?",
        options: [
            "She used to go to school every day.",
            "No, He was tired because he didn't sleep well.",
            "His family was on vacation.",
            "Because he didn't sleep well.",
        ],
        correctAnswer: 3,
        difficulty: "advanced",
    },
    {
        id: 14,
        question: "What's the question for the answer: 'I was in Brazil for 2 months.'?",
        options: [
            "How long were you in Brazil?",
            "How long have you been in Brazil?",
            "How long had you been in Brazil?",
            "How long has been in Brazil?",
        ],
        correctAnswer: 0,
        difficulty: "intermediate",
    },
    {
        id: 15,
        question: "Choose the correct conditional: 'If I were you, I ____ take the course.'",
        options: ["will", "would", "was", "did"],
        correctAnswer: 1,
        difficulty: "intermediate",
    },
    {
        id: 16,
        question: "What does 'I'm not crazy about...' mean?",
        options: [
            "I don't like it.",
            "It's not interesting.",
            "I'm not crazy.",
            "It's interesting.",
        ],
        correctAnswer: 0,
        difficulty: "intermediate",
    },
    {
        id: 17,
        question: "What’s the reported speech of: 'She said, “I’m tired.”'?",
        options: [
            "She said she is tired.",
            "She said she was tired.",
            "She said she tired.",
            "She said I am tired.",
        ],
        correctAnswer: 1,
        difficulty: "advanced",
    },
    {
        id: 18,
        question: "Complete: 'If I had studied more, I ____ the exam.'",
        options: ["would pass", "will pass", "would have passed", "pass"],
        correctAnswer: 2,
        difficulty: "advanced",
    },
    {
        id: 19,
        question: "What does 'get along with' mean?",
        options: [
            "Salir con alguien",
            "Entender una lección",
            "Llevarse bien con alguien",
            "Arreglar algo roto",
        ],
        correctAnswer: 2,
        difficulty: "advanced",
    },
    {
        id: 20,
        question: "What is the correct form: 'By the time I arrived, they ____.'",
        options: ["have left", "had left", "left", "has left"],
        correctAnswer: 1,
        difficulty: "advanced",
    },
    {
        id: 21,
        question: "Choose the correct passive form: 'They built the house in 1990.'",
        options: [
            "The house was built in 1990.",
            "The house is built in 1990.",
            "The house has built in 1990.",
            "The house builded in 1990.",
        ],
        correctAnswer: 0,
        difficulty: "advanced",
    },
    {
        id: 22,
        question: "Answer correctly: 'Would you like to have dinner at Bella's Bistro with me tonight?'",
        options: [
            "Sorry, I'm going away next week.",
            "No, I'm not doing anything.",
            "Yes, that sounds great, but it's my turn to pay.",
            "Maybe, but you cook this time.",
        ],
        correctAnswer: 2,
        difficulty: "advanced",
    },
    {
        id: 23,
        question: "Answer correctly: 'I don't know if you can make it to the party on Saturday, can you?'",
        options: [
            "I can go and have a birthday cake at the bakery.",
            "No, I don't. But my cousin can make it.",
            "Yes, I can make it to the party on Saturday.",
            "This is the third time I ate today.",
        ],  
        correctAnswer: 2,
        difficulty: "advanced",
    },
    {
        id: 24,
        question: "Answer correctly: 'What have you been studying lately?'",
        options: [
            "I have a lot of work to do lately.",
            "No, my time isn't that busy actually.",
            "English, it's my favorite subject.",
            "I haven't been working out lately",
        ],  
        correctAnswer: 2,
        difficulty: "advanced",
    },
];


type Level = "Básico" | "Intermedio" | "Avanzado"

type TestResults = {
    score: number
    level: Level
    answers: number[]
    details: {
        basic: { correct: number; total: number }
        intermediate: { correct: number; total: number }
        advanced: { correct: number; total: number }
    }
}

export default function TestNivel() {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
    const [showResults, setShowResults] = useState(false)
    const [results, setResults] = useState<TestResults | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isModalInstructionsOpen, setIsModalInstructionsOpen] = useState(false)

    const handleAnswerSelect = useCallback((answerIndex: number) => {
        const newAnswers = [...answers]
        newAnswers[currentQuestion] = answerIndex
        setAnswers(newAnswers)
    }, [answers, currentQuestion])

    const calculateResults = useCallback((answers: (number | null)[]) => {
        const answeredQuestions = answers.filter(a => a !== null) as number[]
        
        // Contar respuestas correctas por nivel
        const resultsByLevel = {
            basic: { correct: 0, total: 0 },
            intermediate: { correct: 0, total: 0 },
            advanced: { correct: 0, total: 0 }
        }

        // Calcular aciertos por nivel
        answeredQuestions.forEach((answer, index) => {
            const question = questions[index]
            const isCorrect = answer === question.correctAnswer
            
            switch(question.difficulty) {
                case 'basic':
                    resultsByLevel.basic.total++
                    if (isCorrect) resultsByLevel.basic.correct++
                    break
                case 'intermediate':
                    resultsByLevel.intermediate.total++
                    if (isCorrect) resultsByLevel.intermediate.correct++
                    break
                case 'advanced':
                    resultsByLevel.advanced.total++
                    if (isCorrect) resultsByLevel.advanced.correct++
                    break
            }
        })

        // Calcular porcentajes por nivel
        const basicPercentage = resultsByLevel.basic.total > 0 
            ? (resultsByLevel.basic.correct / resultsByLevel.basic.total) * 100 
            : 0
            
        const intermediatePercentage = resultsByLevel.intermediate.total > 0
            ? (resultsByLevel.intermediate.correct / resultsByLevel.intermediate.total) * 100
            : 0
            
        const advancedPercentage = resultsByLevel.advanced.total > 0
            ? (resultsByLevel.advanced.correct / resultsByLevel.advanced.total) * 100
            : 0

        // Determinar nivel basado en el rendimiento por nivel
        let level: Level = "Básico"
        
        // Si el estudiante responde bien más del 80% de las preguntas avanzadas
        if (advancedPercentage >= 80) {
            level = "Avanzado"
        } 
        // Si responde bien más del 90% de las intermedias y al menos 40% de avanzadas
        else if (intermediatePercentage >= 90 && advancedPercentage >= 40) {
            level = "Avanzado"
        }
        // Si responde bien más del 90% de las básicas y al menos 40% de intermedias
        else if (basicPercentage >= 90 && intermediatePercentage >= 40) {
            level = "Intermedio"
        }
        // Si responde bien más del 50% de las básicas
        else if (basicPercentage >= 50) {
            level = "Básico"
        }
        // Si no cumple con los requisitos mínimos
        else {
            level = "Básico"
        }

        // Calcular puntuación total
        const totalCorrect = resultsByLevel.basic.correct + 
                            resultsByLevel.intermediate.correct + 
                            resultsByLevel.advanced.correct

        return {
            score: totalCorrect,
            level,
            answers: answeredQuestions,
            details: {
                basic: { correct: resultsByLevel.basic.correct, total: resultsByLevel.basic.total },
                intermediate: { correct: resultsByLevel.intermediate.correct, total: resultsByLevel.intermediate.total },
                advanced: { correct: resultsByLevel.advanced.correct, total: resultsByLevel.advanced.total }
            }
        }
    }, [])

    const handleNextQuestion = useCallback(() => {
        if (answers[currentQuestion] === null) {
            ErrorMsj('Por favor selecciona una respuesta');
            return;
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            const unanswered = answers.some(a => a === null);
            if (unanswered) {
                ErrorMsj('Por favor responde todas las preguntas antes de finalizar');
                return;
            }
            
            setIsSubmitting(true);
            setTimeout(() => {
                const results = calculateResults(answers);
                setResults(results);
                setShowResults(true);
                setIsSubmitting(false);
            }, 500);
        }
    }, [answers, currentQuestion, calculateResults])

    const handlePreviousQuestion = useCallback(() => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1)
        }
    }, [currentQuestion])

    const resetTest = useCallback(() => {
        setCurrentQuestion(0)
        setAnswers(Array(questions.length).fill(null))
        setShowResults(false)
        setResults(null)
    }, [])

    const getLevelIcon = (level: Level) => {
        switch (level) {
            case "Básico":
                return <FiBookOpen className="h-12 w-12 text-blue-500" />
            case "Intermedio":
                return <FiStar className="h-12 w-12 text-yellow-500" />
            case "Avanzado":
                return <FiStar className="h-12 w-12 text-green-500" />
        }
    }

    const getLevelColor = (level: Level) => {
        switch (level) {
            case "Básico":
                return "text-blue-600 bg-blue-50 border-blue-200"
            case "Intermedio":
                return "text-yellow-600 bg-yellow-50 border-yellow-200"
            case "Avanzado":
                return "text-green-600 bg-green-50 border-green-200"
        }
    }

    if (showResults && results) {
        return (
            <>
                <ThemeToggle className="fixed top-4 right-4" />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 -mt-20">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test de Nivel de Inglés</h1>
                        <p className="text-gray-600 dark:text-gray-300">Por favor se honesto/a con tus respuestas para obtener un resultado real</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <Card
                            fullWidth
                            variant="elevated"
                            size="lg"
                            title="¡Test Completado!"
                            description={`${results.score} de ${questions.length} respuestas correctas`}
                            className="mb-6"
                            headerContent={
                                <div className="flex flex-col items-center">
                                    <div className="flex justify-center mb-4" aria-hidden="true">
                                        <FiCheckCircle className="h-16 w-16 text-green-500" aria-label="Test completado" />
                                    </div>
                                    <div
                                        className={`inline-flex items-center gap-3 px-6 py-4 rounded-lg border-2 ${getLevelColor(results.level)}`}
                                        role="status"
                                        aria-label={`Nivel alcanzado: ${results.level}`}
                                    >
                                        {getLevelIcon(results.level)}
                                        <div className="flex flex-col items-center">
                                            <p className="text-sm font-medium">Tu nivel ideal es:</p>
                                            <p className="text-2xl font-bold">{results.level}</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        >
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        onClick={() => {
                                            setIsModalInstructionsOpen(true)
                                        }}
                                    >
                                        Inscribirme en Nivel {results.level}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={resetTest}
                                        className="w-full"
                                    >
                                        Repetir Test
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-6 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { level: 'basic', label: 'Básico', color: 'blue' },
                                        { level: 'intermediate', label: 'Intermedio', color: 'yellow' },
                                        { level: 'advanced', label: 'Avanzado', color: 'green' }
                                    ].map(({ level, label, color }) => {
                                        const { correct, total } = results.details[level as keyof typeof results.details];
                                        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
                                        
                                        return (
                                            <div key={level} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300">{label}</h4>
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${color === 'blue' ? 'bg-blue-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                        role="progressbar"
                                                        aria-valuenow={percentage}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                    />
                                                </div>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {correct} de {total} correctas
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Resumen de respuestas:</h3>
                                    <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {results.score} de {questions.length} respuestas correctas
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {questions.map((question, index) => {
                                        const userAnswer = answers[index];
                                        const isCorrect = userAnswer === question.correctAnswer;

                                        return (
                                            <div
                                                key={question.id}
                                                className={`p-4 rounded-lg border ${isCorrect
                                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50'
                                                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50'
                                                    }`}
                                            >
                                                <div className="flex items-start">
                                                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">{question.question}</p>
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                <span className="font-medium">Tu respuesta:</span>{' '}
                                                                <span className={isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                                    {userAnswer !== null ? question.options[userAnswer] : 'No respondida'}
                                                                    {!isCorrect && userAnswer !== null && ' ❌'}
                                                                    {isCorrect && ' ✓'}
                                                                </span>
                                                            </p>
                                                            {!isCorrect && userAnswer !== null && (
                                                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                                    <span className="font-medium">Respuesta correcta:</span>{' '}
                                                                    {question.options[question.correctAnswer]} ✓
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
                {/* Modal para gestionar inscripción */}
                <Modal
                    isOpen={isModalInstructionsOpen}
                    onClose={() => setIsModalInstructionsOpen(false)}
                    title={`Pasos para inscribirte en el curso ${results.level}`}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-left mb-12 shadow-lg border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-white">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                ¿Listo para Empezar?
                            </span>
                            <span className="block text-lg font-medium text-gray-600 dark:text-gray-300 mt-2">
                                Inscríbete en 4 Pasos Sencillos
                            </span>
                        </h2>

                        <ol className="space-y-4 max-w-3xl mx-auto">
                            {[
                                {
                                    title: "Regístrate o Inicia Sesión",
                                    description: "Dirígete a ",
                                    link: "https://www.classnet.org/login",
                                    linkText: "Iniciar Sesión",
                                    afterLink: " y accede rápidamente con tu cuenta de Google."
                                },
                                {
                                    title: "Encuentra Tu Clase Ideal",
                                    description: "Explora nuestro catálogo y verifica el horario que mejor se adapte a ti."
                                },
                                {
                                    title: "Inscríbete y Obtén los Datos Bancarios",
                                    description: "Una vez en la página de la clase, haz clic en \"Inscribirme\" para ver las opciones de pago."
                                },
                                {
                                    title: "Completa tu Inscripción",
                                    description: "Realiza el depósito, sube el comprobante en la plataforma y ¡listo! Nos encargaremos de confirmar tu inscripción."
                                }
                            ].map((step, index) => (
                                <li
                                    key={index}
                                    className={'p-5 rounded-xl transition-all bg-blue-50 dark:bg-gray-700/50'}
                                >
                                    <div className="flex items-start">
                                        <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg mr-4">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                {step.description}
                                                {step.link && (
                                                    <a
                                                        href={step.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                    >
                                                        {step.linkText}
                                                    </a>
                                                )}
                                                {step.afterLink}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                            <p className="text-center text-blue-700 dark:text-blue-300">
                                ¿Necesitas ayuda? Contáctanos en{' '}
                                <a href="mailto:classnet.info@gmail.com" className="font-semibold hover:underline">
                                    classnet.info@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </Modal>
            </>
        );
    }

    const currentQuestionData = questions[currentQuestion]
    const selectedAnswer = answers[currentQuestion]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 -mt-20">
            <ThemeToggle className="fixed top-4 right-4" />
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Test de Nivel de Inglés</h1>
                    <p className="text-gray-600 dark:text-gray-300">Por favor se honesto/a con tus respuestas para obtener un resultado real</p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pregunta {currentQuestion + 1} de {questions.length}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <Card
                    variant="elevated"
                    size="lg"
                    title={currentQuestionData.question}
                    description={`Dificultad: ${currentQuestionData.difficulty}`}
                    className="dark:bg-gray-800"
                    contentClassName="space-y-4"
                    fullWidth
                >
                    <div className="space-y-3">
                        {currentQuestionData.options.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`flex items-center space-x-3 p-4 rounded-lg transition-colors border cursor-pointer ${selectedAnswer === index
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    checked={selectedAnswer === index}
                                    onChange={() => { }}
                                    className="h-5 w-5 text-blue-600 dark:text-blue-500 focus:ring-blue-500"
                                />
                                <label className="flex-1 cursor-pointer text-base dark:text-gray-200">
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestion === 0 || isSubmitting}
                            className="flex-1"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" />
                            Anterior
                        </Button>
                        <Button
                            onClick={handleNextQuestion}
                            disabled={selectedAnswer === null || isSubmitting}
                            className="flex-1"
                            size="lg"
                        >
                            {isSubmitting ? 'Procesando...' :
                                currentQuestion === questions.length - 1 ? 'Ver Resultados' : 'Siguiente Pregunta'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
