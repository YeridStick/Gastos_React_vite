import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PropTypes from 'prop-types';

// Importar servicios
import { syncInitialDataAfterLogin } from "../services/syncService";
import { requestVerificationCode, verifyCode, registerUser } from "../services/authService";
import { STORAGE_KEYS } from "../config/config";

const API_BASE_URL = "http://192.168.80.26:8081/api";

const AuthPages = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [credentials, setCredentials] = useState({
    email: "",
    name: "",
  });
  const [preserveData, setPreserveData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si el usuario quiere preservar datos
  useEffect(() => {
    const shouldPreserveData = localStorage.getItem(STORAGE_KEYS.PRESERVE_DATA);
    if (shouldPreserveData === "true") {
      setPreserveData(true);
      localStorage.removeItem(STORAGE_KEYS.PRESERVE_DATA);
    }
    
    if (window.location.pathname === "/register" && isLogin) {
      setIsLogin(false);
    }
  }, []);

  // Manejar el contador de tiempo para reenviar código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  // Función para manejar el registro de usuarios
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await registerUser(credentials);

      if (data.success) {
        Swal.fire({
          title: "¡Registro exitoso!",
          text: "A continuación solicitaremos un código de verificación",
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
        requestVerificationCode();
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Hubo un problema al registrar el usuario",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo conectar con el servidor",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para solicitar código de verificación
  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await requestVerificationCode(credentials.email);

      // Check if the response was successful based on the HTTP status code
      // and optionally check for the expected message in the response body
      if (data && data.message) { // Assuming the server returns { message: "..." } on success
        setIsCodeSent(true);
        setCountdown(300); // 5 minutos en segundos
        Swal.fire({
          title: "¡Código enviado!",
          text: data.message, // Use the message from the server response
          icon: "success",
          confirmButtonColor: "#3b82f6",
        });
      } else {
        // Handle cases where response is not ok or doesn't contain the expected message
        Swal.fire({
          title: "Error",
          text: data.message || "No se pudo enviar el código de verificación",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error al solicitar código:", error);
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para verificar el código
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      Swal.fire({
        title: "Código requerido",
        text: "Por favor, ingresa el código de verificación",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await verifyCode(credentials.email, verificationCode);

      if (data.token) {
        // Mostrar mensaje de sincronización en proceso
        Swal.fire({
          title: "Sincronizando",
          text: "Obteniendo tus datos financieros...",
          icon: "info",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        let syncSuccess = false;
        
        // Si se eligió preservar datos, primero sincronizamos al servidor los datos locales
        if (preserveData && !isLogin) {
          try {
            // Subir primero los datos locales
            await uploadLocalData(credentials.email, data.token);
            
            // Luego obtener la versión consolidada desde el servidor
            syncSuccess = await syncInitialDataAfterLogin(credentials.email, data.token);
          } catch (err) {
            console.error("Error al sincronizar datos locales:", err);
            syncSuccess = false;
          }
        } else {
          // Si es login normal o registro sin preservar, solo descargamos del servidor
          try {
            syncSuccess = await syncInitialDataAfterLogin(credentials.email, data.token);
          } catch (err) {
            console.error("Error al sincronizar datos desde el servidor:", err);
            syncSuccess = false;
          }
        }

        // Cerrar el mensaje de carga
        Swal.close();
        
        // Mostrar mensaje según el resultado
        if (syncSuccess) {
          Swal.fire({
            title: "¡Inicio de sesión exitoso!",
            text: "Bienvenido a tu gestor financiero personal",
            icon: "success",
            confirmButtonColor: "#3b82f6",
          });
        } else {
          Swal.fire({
            title: "Advertencia",
            text: "Se inició sesión correctamente pero hubo problemas al sincronizar tus datos",
            icon: "warning",
            confirmButtonColor: "#3b82f6",
          });
        }

        // Llamar a la función de éxito de inicio de sesión
        if (onLoginSuccess) {
          onLoginSuccess(data);
        }

        // Redirigir al dashboard
        navigate("/dashboard");
      } else {
        Swal.fire({
          title: "Error de verificación",
          text: data.message || "Código incorrecto o expirado",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error al verificar código:", error);
      Swal.fire({
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para subir datos locales al servidor en caso de preservar datos
  const uploadLocalData = async (email, token) => {
    const timestamp = Date.now();
    
    // Obtener datos del localStorage
    const dataToSync = {
      email: email,
      data: {
        [STORAGE_KEYS.GASTOS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.GASTOS) || "[]"),
        [STORAGE_KEYS.METAS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.METAS) || "[]"),
        [STORAGE_KEYS.CATEGORIAS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIAS) || "[]"),
        [STORAGE_KEYS.RECORDATORIOS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDATORIOS) || "[]"),
        [STORAGE_KEYS.PRESUPUESTO]: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRESUPUESTO) || "0"),
        [STORAGE_KEYS.INGRESOS]: JSON.parse(localStorage.getItem(STORAGE_KEYS.INGRESOS) || "[]")
      },
      timestamp: timestamp
    };
    
    // Enviar datos al servidor
    const response = await fetch(`${API_BASE_URL}/sync/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dataToSync)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al sincronizar datos");
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    return true;
  };

  // Cambiar entre formularios de inicio de sesión y registro
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsCodeSent(false);
    setVerificationCode("");
    setCredentials({
      email: "",
      name: "",
    });
  };
  
  // Volver a la pantalla inicial
  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
        {!isCodeSent ? (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {isLogin 
                  ? "Inicia sesión en tu cuenta" 
                  : "Crea tu cuenta de finanzas"}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {isLogin 
                  ? "Ingresa a tu espacio financiero personal" 
                  : "Comienza a gestionar tus finanzas personales"}
              </p>
              
              {!isLogin && preserveData && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  Se conservarán tus datos existentes al crear la cuenta
                </div>
              )}
            </div>

            <form className="mt-8 space-y-6" onSubmit={isLogin ? handleRequestCode : handleRegister}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={credentials.email}
                    onChange={handleChange}
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Correo electrónico"
                    disabled={isLoading}
                  />
                </div>
                
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="sr-only">Nombre</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={credentials.name}
                      onChange={handleChange}
                      className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Nombre completo"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    isLogin ? "Solicitar código" : "Registrarse"
                  )}
                </button>
              </div>
            </form>
            
            {/* Enlaces para cambiar entre login/registro y volver */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={toggleForm}
                className="font-medium text-blue-600 hover:text-blue-500 text-sm text-center"
                disabled={isLoading}
              >
                {isLogin 
                  ? "¿No tienes una cuenta? Regístrate" 
                  : "¿Ya tienes una cuenta? Inicia sesión"}
              </button>
              
              <button 
                onClick={handleGoBack}
                className="font-medium text-gray-500 hover:text-gray-700 text-xs text-center"
                disabled={isLoading}
              >
                Volver a la pantalla de inicio
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Código de Autenticación en Dos Pasos
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Has solicitado iniciar sesión en tu cuenta. Para continuar, introduce el siguiente código:
              </p>
            </div>
          
            <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
              <div>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ingresa el código de 6 dígitos"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {countdown > 0 
                    ? `El código expirará en ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` 
                    : "El código ha expirado"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={countdown > 0 || isLoading}
                  className={`text-sm font-medium ${
                    countdown > 0 || isLoading
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  Reenviar código
                </button>
                <button
                  type="submit"
                  className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    "Verificar"
                  )}
                </button>
              </div>
            </form>
            
            <button 
              onClick={() => setIsCodeSent(false)}
              className="w-full mt-4 font-medium text-gray-500 hover:text-gray-700 text-xs text-center"
              disabled={isLoading}
            >
              Volver atrás
            </button>
          </>
        )}
      </div>
    </div>
  );
};

AuthPages.propTypes = {
  onLoginSuccess: PropTypes.func
};

export default AuthPages;