"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiClock, FiUsers, FiGlobe, FiMessageCircle, FiCheckCircle } from "react-icons/fi"
import { FiVideo, FiMail, FiHelpCircle, FiMenu, FiX, FiPlay } from "react-icons/fi"
import { Button, Card } from "@/components"
import { useRouter } from "next/navigation"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function ClassnetLanding() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  const benefits = [
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: "100% Online y Flexible",
      description:
        "Estudia desde casa, el trabajo o donde prefieras, a tu ritmo y con horarios que se ajustan a tu vida.",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Clases Interactivas y Dinámicas",
      description:
        "Participa activamente con profesores nativos o bilingües y compañeros en un ambiente divertido y efectivo.",
    },
    {
      icon: <FiVideo className="w-8 h-8" />,
      title: "Grabación de las Clases Disponible",
      description:
        "Si no estás disponible para una clase en vivo, puedes acceder a la grabación de la clase para practicar en tu tiempo libre.",
    },
    {
      icon: <FiClock className="w-8 h-8" />,
      title: "Plataforma Intuitiva",
      description: "Accede a todos tus materiales, clases en vivo y recursos adicionales de forma sencilla.",
    },
    {
      icon: <FiMessageCircle className="w-8 h-8" />,
      title: "Soporte Personalizado",
      description: "Recibe retroalimentación constante y apoyo para asegurar tu progreso.",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Comunidad Vibrante",
      description:
        "Una vez inscrito, tendrás acceso a un grupo exclusivo de WhatsApp para practicar, resolver dudas y conectar con otros estudiantes.",
    },
  ]

  const advantages = [
    {
      icon: <FiClock className="w-8 h-8" />,
      title: "Horarios que se Adaptan a Ti",
      description:
        "Olvídate de los horarios rígidos. Nuestras clases en vivo tienen múltiples opciones y todas quedan grabadas para que las veas cuando puedas.",
      highlight: "Flexibilidad Total",
    },
    {
      icon: <FiPlay className="w-8 h-8" />,
      title: "Clases Grabadas 24/7",
      description:
        "¿Perdiste una clase? ¿Quieres repasar? Accede a todas las grabaciones desde tu plataforma personal, las veces que necesites.",
      highlight: "Siempre Disponible",
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: "Seguimiento Personalizado",
      description:
        "Recibe retroalimentación constante sobre tu progreso. Sabemos exactamente en qué necesitas mejorar y cómo ayudarte.",
      highlight: "Progreso Medible",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Profesores Dedicados",
      description:
        "Nuestros instructores no solo enseñan, te acompañan. Están disponibles para resolver dudas y motivarte en cada paso.",
      highlight: "Apoyo Constante",
    },
    {
      icon: <FiMessageCircle className="w-8 h-8" />,
      title: "Comunidad de Apoyo",
      description:
        "Únete a nuestro grupo exclusivo donde practicas con otros estudiantes, compartes dudas y celebras logros juntos.",
      highlight: "Nunca Solo",
    },
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: "Tecnología Intuitiva",
      description:
        "Plataforma fácil de usar desde cualquier dispositivo. Todo está diseñado para que te enfoques en aprender, no en complicaciones técnicas.",
      highlight: "Sin Complicaciones",
    },
  ]

  const levels = [
    {
      title: "Nivel Básico",
      description: "Inglés desde 0, Ideal para principiantes o quienes quieran reforzar las bases.",
      schedule: "Horarios Flexibles",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Nivel Intermedio",
      description: "Perfecto para quienes ya tienen nociones y buscan mayor confianza.",
      schedule: "Horarios Flexibles",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Nivel Avanzado",
      description: "Ideal si quieres mejorar tu fluidez y practicar gramáticas avanzadas",
      schedule: "Horarios Flexibles",
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <div className="min-h-screen bg-white -mt-16">
      {/* Sticky Navigation Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" : "bg-transparent"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center cursor-pointer"
              onClick={() => scrollToSection("hero")}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold">
                <span className={`${isScrolled ? "text-purple-600" : "text-white"}`}>Class</span>
                <span className={`${isScrolled ? "text-orange-500" : "text-orange-400"}`}>net</span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("hero")}
                className={`font-medium transition-colors hover:text-orange-500 ${isScrolled ? "text-gray-700" : "text-white"
                  }`}
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className={`font-medium transition-colors hover:text-orange-500 ${isScrolled ? "text-gray-700" : "text-white"
                  }`}
              >
                Beneficios
              </button>
              <button
                onClick={() => scrollToSection("levels")}
                className={`font-medium transition-colors hover:text-orange-500 ${isScrolled ? "text-gray-700" : "text-white"
                  }`}
              >
                Niveles
              </button>
              <button
                onClick={() => scrollToSection("advantages")}
                className={`font-medium transition-colors hover:text-orange-500 ${isScrolled ? "text-gray-700" : "text-white"
                  }`}
              >
                Beneficios
              </button>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 font-semibold rounded-full shadow-md"
                  onClick={() => router.push("/login")}
                >
                  ¡Inscríbete Ahora!
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <FiX className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`} />
              ) : (
                <FiMenu className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <motion.div
            className={`md:hidden overflow-hidden ${isMenuOpen ? "max-h-96" : "max-h-0"}`}
            initial={false}
            animate={{ height: isMenuOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="py-4 space-y-4 bg-white/95 backdrop-blur-md rounded-b-lg shadow-lg">
              <button
                onClick={() => scrollToSection("hero")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-orange-500 font-medium"
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-orange-500 font-medium"
              >
                Beneficios
              </button>
              <button
                onClick={() => scrollToSection("levels")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-orange-500 font-medium"
              >
                Niveles
              </button>
              <button
                onClick={() => scrollToSection("advantages")}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-orange-500 font-medium"
              >
                Beneficios
              </button>
              <div className="px-4 pt-2 space-y-2">
                <Button
                  size="sm"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full"
                  onClick={() => router.push("/login")}
                >
                  ¡Inscríbete Ahora!
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/8298647008"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <FiMessageCircle className="w-6 h-6" />
      </motion.a>
      {/* Hero Section */}
      <section
        id="hero"
        className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white overflow-hidden pt-16"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-10 lg:py-20">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" variants={fadeInUp}>
              ¡Domina el Inglés <span className="text-orange-400">100% Online</span> con Classnet!
            </motion.h1>

            <motion.h2 className="text-xl md:text-2xl lg:text-3xl mb-8 text-purple-100" variants={fadeInUp}>
              Aprende Inglés a Tu Ritmo, Desde Donde Quieras
            </motion.h2>

            <motion.p className="text-lg md:text-xl mb-12 text-purple-200 max-w-2xl mx-auto " variants={fadeInUp}>
              Clases Interactivas y Horarios Flexibles. Transforma tu Futuro con Fluidez en Inglés.
            </motion.p>

            <motion.div className="mb-12 px-4" variants={fadeInUp}>
              <div className="relative max-w-md mx-auto">
                <video
                  id="hero-video"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                  poster="https://classnetbucket.s3.us-east-2.amazonaws.com/project_meta_data/landing_page_video_poster.png"
                  controls
                  playsInline
                >
                  <source src="https://classnetbucket.s3.us-east-2.amazonaws.com/project_meta_data/1min_landing_page.mp4" type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
                <motion.button
                  id="play-button"
                  className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-black/30 rounded-full group hover:bg-black/40 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const video = document.getElementById('hero-video') as HTMLVideoElement;
                    video.play();
                    const button = document.getElementById('play-button');
                    if (button) button.style.display = 'none';
                  }}
                >
                  <div className="bg-orange-500 rounded-full p-4 group-hover:bg-orange-400 transition-colors">
                    <FiPlay className="w-8 h-8 text-white ml-1" />
                  </div>
                </motion.button>
              </div>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeInUp}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
                >
                  ¡Inscríbete Hoy y Comienza Gratis!
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              ¿Cansado de Métodos Antiguos? <span className="text-purple-600">Descubre la Manera Moderna</span> de
              Aprender Inglés
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Sabemos que aprender inglés puede ser un desafío. Las clases tradicionales son buenas pero rígidas, los horarios a veces no se
              adaptan a tu vida y sientes que no avanzas. En Classnet, hemos diseñado un método 100% online que
              se adapta a TI.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full dark:bg-white hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <div className="text-purple-600 mb-4 flex justify-center">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Levels Section */}
      <section id="levels" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Encuentra el <span className="text-orange-500">Nivel Perfecto</span> Para Ti
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Ofrecemos clases diseñadas para cada etapa de tu aprendizaje. Empieza desde cero o perfecciona lo que ya
              sabes.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto md:justify-between md:items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {levels.map((level, index) => (
              <motion.div key={index} variants={fadeInUp} className="flex-1 flex items-center justify-center min-w-0">
                <Card className="overflow-hidden dark:bg-white hover:shadow-xl transition-shadow duration-300">
                  <div className={`h-2 bg-gradient-to-r ${level.color}`}></div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{level.title}</h3>
                  <p className="text-gray-600 mb-6">{level.description}</p>
                  <div className="flex items-center text-gray-700 mb-6">
                    <FiClock className="w-5 h-5 mr-2 text-purple-600" />
                    <span className="font-medium">{level.schedule}</span>
                  </div>
                  {/* <Button
                      variant="outline"
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-transparent"
                    >
                      Ver Contenido del Curso
                    </Button> */}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advantages Section - Diseñado para Tu Éxito */}
      <section id="advantages" className="py-20 bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-purple-600">Diseñado para Tu Éxito:</span> Nuestra Metodología Única
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Cada aspecto de Classnet está pensado para eliminar las barreras tradicionales del aprendizaje y maximizar
              tu progreso hacia la fluidez en inglés.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {advantages.map((advantage, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full dark:bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md group hover:scale-105 relative overflow-hidden">
                  {/* Highlight Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {advantage.highlight}
                  </div>

                  {/* Icon with gradient background */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white">{advantage.icon}</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{advantage.description}</p>

                  {/* Decorative element */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Optional future testimonials teaser */}
          <motion.div
            className="text-center mt-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">🌟 Estamos Construyendo Algo Increíble</h3>
              <p className="text-gray-600">
                Nuestros primeros estudiantes ya están experimentando estos beneficios. Pronto compartiremos sus
                historias de éxito contigo.
                <span className="font-medium text-purple-600"> ¡Sé parte de la primera generación de Classnet!</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              ¡No Esperes Más para Hablar Inglés con <span className="text-orange-400">Confianza!</span>
            </h2>

            <motion.div className="mb-12" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-lg"
                onClick={() => router.push('/login')}
              >
                ¡Quiero Inscribirme Ahora!
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <motion.a
                href="https://wa.me/8298647008"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiMessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </motion.a>

              <motion.a
                href={"mailto:" + process.env.FROM_EMAIL}
                className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiMail className="w-5 h-5" />
                <span>Email</span>
              </motion.a>

              <motion.button
                className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/faq')}
              >
                <FiHelpCircle className="w-7 h-7" />
                <span>Preguntas Frecuentes</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <motion.div
              className="mb-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h3 className="text-3xl font-bold text-orange-400 mb-2">Classnet</h3>
              <p className="text-gray-400">Aprende Inglés a Tu Ritmo</p>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-6 mb-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div className="flex flex-col items-center group" variants={fadeInUp}>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mb-1">Próximamente</span>
                <div className="relative">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
                    Política de Privacidad
                  </a>
                  <div className="absolute z-10 hidden group-hover:block w-48 p-2 mt-1 text-sm text-gray-700 bg-white rounded-md shadow-lg">
                    Estamos trabajando en esta página. ¡Vuelve pronto!
                  </div>
                </div>
              </motion.div>
              <motion.div className="flex flex-col items-center group" variants={fadeInUp}>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mb-1">Próximamente</span>
                <div className="relative">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
                    Términos y Condiciones
                  </a>
                  <div className="absolute z-10 hidden group-hover:block w-48 p-2 mt-1 text-sm text-gray-700 bg-white rounded-md shadow-lg">
                    Estamos trabajando en esta página. ¡Vuelve pronto!
                  </div>
                </div>
              </motion.div>
              <motion.div className="flex flex-col items-center group" variants={fadeInUp}>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mb-1">Próximamente</span>
                <div className="relative">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
                    Contacto
                  </a>
                  <div className="absolute z-10 hidden group-hover:block w-48 p-2 mt-1 text-sm text-gray-700 bg-white rounded-md shadow-lg">
                    Estamos trabajando en esta página. ¡Vuelve pronto!
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.p
              className="text-gray-500"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              ©️ 2024 Classnet. Todos los derechos reservados.
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  )
}