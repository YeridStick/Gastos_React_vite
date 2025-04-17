import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";

const Welcome = () => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  
  // Verificar si hay datos en localStorage
  const hasLocalData = () => {
    return (
      localStorage.getItem("ObjetosGastos") ||
      localStorage.getItem("PresupuestoLS") ||
      localStorage.getItem("IngresosExtra") ||
      localStorage.getItem("MetasAhorro") ||
      localStorage.getItem("categorias") ||
      localStorage.getItem("recordatorios")
    );
  };
  
  const handleContinueWithoutAccount = () => {
    // Simplemente redirigir al dashboard sin autenticar
    navigate("/dashboard");
  };
  
  const handleCreateAccount = () => {
    const hasData = hasLocalData();
    
    if (hasData) {
      // Preguntar si desea mantener los datos actuales
      Swal.fire({
        title: "¿Conservar tus datos actuales?",
        text: "Detectamos que ya tienes información guardada en este dispositivo. ¿Quieres conservarla en tu nueva cuenta?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, conservar mis datos",
        cancelButtonText: "No, empezar desde cero",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
      }).then((result) => {
        if (result.isConfirmed) {
          // Guardar indicador para conservar datos durante el registro
          localStorage.setItem("preserveDataOnSignup", "true");
          navigate("/register");
        } else {
          // Indicar que no se conservarán los datos
          localStorage.setItem("preserveDataOnSignup", "false");
          navigate("/register");
        }
      });
    } else {
      // No hay datos, simplemente ir al registro
      navigate("/register");
    }
  };
  
  const handleLogin = () => {
    navigate("/login");
  };

  const toggleWarning = () => {
    setShowWarning(!showWarning);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <svg
              className="h-16 w-16 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Gestión de Gastos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tu herramienta personal para administrar tus finanzas
          </p>
        </div>
        
        {/* Nota informativa plegable */}
        <div className="flex flex-col">
          <button 
            onClick={toggleWarning}
            className="flex items-center justify-between text-left text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
          >
            <span>Información importante sobre cuentas y datos</span>
            <svg
              className={`h-5 w-5 transform transition-transform duration-200 ${showWarning ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showWarning && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-blue-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <span className="font-semibold">Si creas una cuenta</span>: Podrás ver tus datos financieros en cualquier dispositivo iniciando sesión (solo se permite una sesión activa a la vez).
                  </p>
                  <p className="text-xs text-blue-800 mt-2 leading-relaxed">
                    <span className="font-semibold">Importante</span>: Si inicias sesión con otra cuenta diferente o restableces la aplicación, perderás los datos locales que no estén asociados a una cuenta.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleContinueWithoutAccount}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            Continuar sin cuenta
          </button>
          
          <button
            onClick={handleCreateAccount}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            Crear una cuenta
          </button>
          
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            Iniciar sesión
          </button>
        </div>
        
        <div>
          <p className="text-xs text-center text-gray-500">
            Crear una cuenta te permite sincronizar tus datos entre dispositivos y 
            tener respaldo en la nube.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;