import { useState, useEffect } from 'react'

export default function Filtros({ filtros, setFiltros }) {
  const [categorias, setCategorias] = useState([
    { id: "", nombre: "Todos" }
  ]);

  // Cargar categorías desde localStorage
  useEffect(() => {
    const cargarCategorias = () => {
      try {
        const categoriasGuardadas = localStorage.getItem('categorias');
        
        if (categoriasGuardadas) {
          const categoriasParseadas = JSON.parse(categoriasGuardadas);
          
          // Agregar la opción "Todos" al inicio
          setCategorias([
            { id: "", nombre: "Todos" },
            ...categoriasParseadas
          ]);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    
    cargarCategorias();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'categorias') {
        cargarCategorias();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium leading-6 text-gray-900">Filtrar Gastos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Selecciona una categoría para filtrar tus gastos
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setFiltros(categoria.id)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  filtros === categoria.id
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-600'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }
              `}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}