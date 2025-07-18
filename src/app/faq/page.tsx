"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"
import { Button } from "@/components"

const FAQCategories = [
  {
    title: "Sobre Classnet y la Plataforma",
    items: [
      {
        question: "¿Qué es Classnet?",
        answer: "Classnet es una plataforma de aprendizaje de inglés en línea que ofrece clases en vivo y grabadas con profesores nativos y bilingües."
      },
      {
        question: "¿Cómo funciona la plataforma de Classnet?",
        answer: "Accede a través de tu navegador web, por tu computadora o celular sin necesidad de descargar software especial. Las clases se realizan en tiempo real y quedan grabadas para su revisión posterior."
      },
      {
        question: "¿Necesito algún software especial para tomar las clases?",
        answer: "No, solo necesitas un navegador web moderno y conexión a internet. Recomendamos usar auriculares con micrófono para mejor experiencia."
      },
      {
        question: "¿Puedo acceder a Classnet desde mi teléfono móvil o tablet?",
        answer: "¡Sí! Nuestra plataforma es completamente responsive y funciona perfectamente en dispositivos móviles y tablets."
      }
    ]
  },
  {
    title: "Sobre las Clases y Niveles",
    items: [
      {
        question: "¿Qué niveles de inglés ofrecen?",
        answer: "Ofrecemos tres niveles principales: Básico, Intermedio y Avanzado, cada uno con un programa específico de aprendizaje."
      },
      {
        question: "¿Cómo sé cuál es mi nivel de inglés?",
        answer: "Al registrarte, podrás realizar una prueba de nivel gratuita para determinar tu nivel actual y recomendarte el curso adecuado."
      },
      {
        question: "¿Son las clases en vivo o grabadas?",
        answer: "Ofrecemos clases en vivo con profesores en tiempo real, y todas las clases quedan grabadas para que puedas revisarlas cuando quieras."
      },
      {
        question: "¿Qué pasa si no puedo asistir a una clase en vivo?",
        answer: "No hay problema. Todas las clases quedan grabadas y puedes acceder a ellas en cualquier momento desde tu cuenta."
      },
      {
        question: "¿Cuántos estudiantes hay por clase?",
        answer: "Mantenemos grupos de hasta 30 estudiantes para asegurar una experiencia de aprendizaje personalizada y efectiva."
      },
      {
        question: "¿Cuál es la duración de cada clase?",
        answer: "Depende de cómo el profesor lo ajuste, cada clase puede ser distinta."
      },
      {
        question: "¿Hay tareas o asignaciones? ¿Cómo funcionan?",
        answer: "Sí, cada clase incluye ejercicios y tareas prácticas. Puedes enviarlas a través de la plataforma y recibirás retroalimentación personalizada."
      },
      {
        question: "¿Obtendré un certificado al finalizar un nivel/curso?",
        answer: "¡Sí! Al completar cada nivel con éxito, recibirás un certificado digital que acredita tu nivel de inglés."
      }
    ]
  },
  {
    title: "Sobre los Profesores",
    items: [
      {
        question: "¿Quiénes son los profesores de Classnet?",
        answer: "Nuestros profesores son nativos o bilingües con certificaciones en habla de inglés como segunda lengua."
      }
    ]
  },
  {
    title: "Sobre Precios y Pagos",
    items: [
      {
        question: "¿Cuánto cuestan las clases?",
        answer: "Los precios varían según el nivel y el plan elegido. Puedes ver nuestros planes y precios en la sección de buscar clases."
      },
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Solo aceptamos transferencia bancaria a distintos bancos (por ahora)."
      },
      {
        question: "¿Hay descuentos?",
        answer: "¡Sí! ya sea que invitas a alguien más a la plataforma o pagues la clase completa por adelantado, tendrás un descuento del 10%."
      },
      {
        question: "¿Cuál es la política de reembolso?",
        answer: "Ofrecemos un período de prueba de 7 días. Si no estás satisfecho, podemos ofrecerte un reembolso completo."
      }
    ]
  },
  {
    title: "Registro e Inscripción",
    items: [
      {
        question: "¿Cómo me registro en Classnet?",
        answer: "Puedes registrarte fácilmente a través de nuestra página web. Solo necesitas ingresar con google o completar un formulario, buscar la clase y realizar el pago correspondiente."
      },
      {
        question: "¿Cómo me inscribo en un curso?",
        answer: "Una vez registrado, ve a buscar clases y selecciona el nivel que deseas cursar y comenzarás a recibir acceso a las clases y materiales."
      },
      {
        question: "¿Qué hago si olvidé mi contraseña?",
        answer: "Contacta a soporte técnico."
      }
    ]
  },
  {
    title: "Soporte y Contacto",
    items: [
      {
        question: "¿Cómo puedo contactar a soporte técnico?",
        answer: "Puedes contactarnos a través de nuestro número 829-864-7008 o correo electrónico " + process.env.NEXT_PUBLIC_EMAIL_SUPPORT + ". Estamos disponibles de lunes a viernes."
      },
      {
        question: "¿Tienen grupos de WhatsApp para estudiantes?",
        answer: "¡Sí! Una vez inscrito en un curso, tendrás acceso a un grupo exclusivo de WhatsApp para practicar y conectarte con otros estudiantes."
      }
    ]
  }
]

export default function FAQPage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white -mt-16">
      {/* Header */}
      <header className={`sticky top-0 z-50 bg-gradient-to-br from-purple-600 to-purple-800 text-white transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-lg' : 'py-12'
      }`}>
        <div className="container mx-auto px-4">
          <h1 className={`font-bold text-center transition-all duration-300 ${
            isScrolled ? 'text-2xl' : 'text-4xl md:text-5xl mb-4'
          }`}>
            Preguntas Frecuentes
          </h1>
          <p className={`text-center text-purple-100 max-w-2xl mx-auto transition-all duration-300 ${
            isScrolled ? 'text-sm opacity-0 h-0' : 'text-xl'
          }`}>
            Encuentra respuestas a las preguntas más comunes sobre ClassNet
          </p>
        </div>
      </header>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          {FAQCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveCategory(activeCategory === categoryIndex ? null : categoryIndex)}>
                <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                {activeCategory === categoryIndex ? (
                  <FiChevronUp className="w-6 h-6 text-purple-600" />
                ) : (
                  <FiChevronDown className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: activeCategory === categoryIndex ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                {category.items.map((faq, faqIndex) => (
                  <motion.div
                    key={faqIndex}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md p-4 mb-4"
                  >
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveFAQ(activeFAQ === faqIndex ? null : faqIndex)}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                        {activeFAQ === faqIndex ? (
                          <FiChevronUp className="w-5 h-5 text-purple-600" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: activeFAQ === faqIndex ? "auto" : 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
              onClick={() => window.location.href = "/login"}
            >
              ¡Inscríbete Ahora!
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
