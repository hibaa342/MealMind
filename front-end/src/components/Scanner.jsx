import React, { useState } from 'react'

const Scanner = ({ onScanComplete }) => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detectedIngredients, setDetectedIngredients] = useState([])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScan = async () => {
    if (!image) return
    
    setLoading(true)
    // Simuler l'appel API pour détecter les ingrédients
    setTimeout(() => {
      const mockIngredients = ['tomates', 'oignons', 'ail', 'pâtes']
      setDetectedIngredients(mockIngredients)
      if (onScanComplete) {
        onScanComplete(mockIngredients)
      }
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="card">
      <h3>Scanner votre frigo</h3>
      <p>Prenez une photo de votre frigo ou armoire</p>
      
      <input 
        type="file" 
        accept="image/*"
        onChange={handleImageUpload}
        style={{ margin: '10px 0' }}
      />
      
      {preview && (
        <div>
          <img src={preview} alt="Prévisualisation" style={styles.preview} />
        </div>
      )}
      
      <button 
        onClick={handleScan} 
        className="btn btn-primary"
        disabled={!image || loading}
      >
        {loading ? 'Analyse en cours...' : 'Scanner les ingrédients'}
      </button>
      
      {detectedIngredients.length > 0 && (
        <div style={styles.results}>
          <h4>Ingrédients détectés :</h4>
          <ul>
            {detectedIngredients.map((ing, index) => (
              <li key={index}>{ing}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const styles = {
  preview: {
    maxWidth: '300px',
    maxHeight: '300px',
    margin: '10px 0',
    borderRadius: '5px'
  },
  results: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px'
  }
}

export default Scanner