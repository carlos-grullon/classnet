// import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col mt-24 min-h-screen">
      <h1 className="text-8xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent p-4">
        ClassNet
      </h1>
      <div className="text-lg text-center my-4 text-green-200">
        Sistema de clases virtuales para estudiantes y profesores,
        <br />
        pronto disponible.
      </div>
    </div>
  );
}
