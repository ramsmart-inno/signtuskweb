// Main Index.js or App.js

import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Designer } from '@pmee/ui';
import { text, image, barcodes, dateTime } from '@pmee/schemas';
import { generatePDF } from './helper';
import './App.css';
import { toPng } from 'html-to-image';
import { base64Image, basePdfUrl, updateBaseImageUrl, updateBasePdfUrl, updateImageDimensions, imageDimensions } from './variables';
import QRCodeStyling, { DrawType, TypeNumber, Mode, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType, FileExtension, Options } from "qr-code-styling";


// Main Screen
const MainScreen = () => {
  const [base64Pdf, setBase64Pdf] = useState<string>('');
  const [imgSrc, setImgSrc] = useState<string>('');
  const [base64Image, setBase64Image] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [options, setOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: 'svg' as DrawType,
    data: 'http://qr-code-styling.com',
    image: '/favicon.ico',
    margin: 10,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: 'Byte' as Mode,
      errorCorrectionLevel: 'Q' as ErrorCorrectionLevel
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 20,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      color: '#222222',
      // gradient: {
      //   type: 'linear', // 'radial'
      //   rotation: 0,
      //   colorStops: [{ offset: 0, color: '#8688B2' }, { offset: 1, color: '#77779C' }]
      // },
      type: 'rounded' as DotType
    },
    backgroundOptions: {
      color: '#5FD4F3',
      // gradient: {
      //   type: 'linear', // 'radial'
      //   rotation: 0,
      //   colorStops: [{ offset: 0, color: '#ededff' }, { offset: 1, color: '#e6e7ff' }]
      // },
    },
    cornersSquareOptions: {
      color: '#222222',
      type: 'extra-rounded' as CornerSquareType,
      // gradient: {
      //   type: 'linear', // 'radial'
      //   rotation: 180,
      //   colorStops: [{ offset: 0, color: '#25456e' }, { offset: 1, color: '#4267b2' }]
      // },
    },
    cornersDotOptions: {
      color: '#222222',
      type: 'dot' as CornerDotType,
      // gradient: {
      //   type: 'linear', // 'radial'
      //   rotation: 180,
      //   colorStops: [{ offset: 0, color: '#00266e' }, { offset: 1, color: '#4060b3' }]
      // },
    }
  });
  const [fileExt, setFileExt] = useState<FileExtension>("svg");
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode.update(options);
  }, [qrCode, options]);

  const onDataChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (ref.current) {
      const dataUrl = await toPng(ref.current); // Convert ref to an image
      setImgSrc(dataUrl); // Update img src
    }
    setOptions(options => ({
      ...options,
      data: event.target.value
    }));
  };

  const onExtensionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFileExt(event.target.value as FileExtension);
  };

  const onDownloadClick = () => {
    if (!qrCode) return;
    qrCode.download({
      extension: fileExt
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    console.log(`File upload triggered for type: ${type}`);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        console.log('Base64 String:', base64String);

        if (type === 'pdf') {
          setBase64Pdf(base64String);
          updateBasePdfUrl(base64String); // Update variable
        } else if (type === 'image') {
          if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
              console.log(`Image loaded. Width: ${img.width}, Height: ${img.height}`);
              setImageDimensions({ width: img.width, height: img.height });
              updateImageDimensions(img.width, img.height);
              setBase64Image(base64String);
              updateBaseImageUrl(base64String);
            };
            img.onerror = () => {
              console.error('Failed to load the image.');
            };
            img.src = base64String;
          } else {
            console.error('Uploaded file is not an image.');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Main Screen</h1>

      {/* Upload PDF */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="upload-pdf" style={{ marginRight: '10px' }}>Upload PDF:</label>
        <input
          id="upload-pdf"
          type="file"
          accept="application/pdf"
          onChange={(event) => handleFileUpload(event, 'pdf')}
        />
      </div>

      {/* Upload Image */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="upload-image" style={{ marginRight: '10px' }}>Upload Image:</label>
        <input
          id="upload-image"
          type="file"
          accept="image/*"
          onChange={(event) => handleFileUpload(event, 'image')}
        />
      </div>

      {/* Dropdown Field */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="dropdown-field" style={{ marginRight: '10px' }}>Select an Option:</label>
        <select id="dropdown-field" style={{ padding: '5px' }} onChange={(e) => console.log(`Selected: ${e.target.value}`)}>
          <option value="one">One</option>
          <option value="two">Two</option>
          <option value="three">Three</option>
        </select>
      </div>

      {/* Display Image Dimensions */}
      {base64Image && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={base64Image} alt="Uploaded" style={{ maxWidth: '200px', maxHeight: '200px' }} />
          <p>Width: {imageDimensions.width}px</p>
          <p>Height: {imageDimensions.height}px</p>
        </div>
      )}

      <h2>QR Code Generator</h2>
      <div ref={ref} />
      <div style={styles.inputWrapper}>
        <input value={options.data} onChange={onDataChange} style={styles.inputBox} />
        <select onChange={onExtensionChange} value={fileExt}>
          <option value="svg">SVG</option>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WEBP</option>
        </select>
        <button onClick={onDownloadClick}>Download</button>
      </div>

      <h2>Sample Stamp Card</h2>
      <div style={styles.row}>
        <img src={imgSrc || "https://placehold.co/100x100"} alt="QR code" style={styles.qrCode} />
        <div style={styles.details}>
          <p style={{ ...styles.detailText, ...styles.boldText }}>
            Signed by: Alice &lt;alice@example.com&gt;
          </p>
          <p style={styles.detailText}>2021-06-24 08:00:00 CEST</p>
          <p style={styles.detailText}>https://example.com</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Link to="/screen-a" style={styles.button}>
          Go to Screen A (PDF Designer)
        </Link>
        <Link to="/screen-b" style={styles.button}>
          Go to Screen B
        </Link>
      </div>
    </div>
  );

};

// Screen A (Your Designer Component)
const ScreenA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<Designer | null>(null);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      const template = {
        basePdf: basePdfUrl, // Replace with your base PDF data URL
        schemas: [
          [
            {
              name: 'Text',
              type: 'text',
              position: { x: 100, y: 60 },
              content: 'aeafeafeaefsefsfs',
              width: 10,
              height: 10,
            },
            {
              name: 'qrCode',
              type: 'qrcode',
              content: 'https://pdfme.com/',
              position: { x: 100, y: 70 },
              width: 30,
              height: 30,
              rotate: 0,
            },
            {
              name: 'photo',
              type: 'image',
              content: base64Image,
              position: { x: 24.99, y: 65.61 },
              width: 100,
              height: 100,
            },
            {
              name: 'dateTime',
              type: 'dateTime',
              position: { x: 50, y: 200 },
              width: 45,
              height: 10,
              readOnly: false,
              format: 'yyyy/MM/dd HH:mm',
              placeholder: 'Select Date and Time',
              content: '2024/11/19 13:28',
            },
          ],
        ],
      };

      const designer = new Designer({
        domContainer: containerRef.current,
        template,
        plugins: {
          text,
          image,
          dateTime,
          qrcode: barcodes.qrcode,
        },
      });

      designerRef.current = designer;
      setFields(template.schemas);

      return () => {
        designer.destroy();
        designerRef.current = null;
      };
    }
  }, []);

  const handleGetAllFields = () => {
    if (designerRef.current) {
      const currentTemplate = designerRef.current.getTemplate();
      setFields(currentTemplate.schemas);
      console.log('All Template Fields:', currentTemplate.schemas);
    }
  };

  return (
    <div className="App">
      <button onClick={handleGetAllFields} style={{ marginBottom: '20px' }}>
        Get All Template Fields
      </button>
      <button onClick={() => generatePDF(designerRef.current)} style={{ marginBottom: '20px' }}>
        Download PDF
      </button>

      <div
        ref={containerRef}
        style={{ width: '100%', height: '80vh', border: '1px solid #ccc' }}
      ></div>
      <div style={{ marginTop: '20px' }}>
        <h3>Current Fields:</h3>
        <pre>{JSON.stringify(fields, null, 2)}</pre>
      </div>
    </div>
  );
};

// Screen B (Placeholder)
const ScreenB = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Screen B</h1>
      <button style={{ ...styles.button, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-arrow-left"
          viewBox="0 0 16 16"
        >
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H2.707l4.147 4.146a.5.5 0 0 1-.708.708l-5-5a.5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5z" />
        </svg>
        Back to Main Screen
      </button>
    </div>
  );
};

// App Component
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/screen-a" element={<ScreenA />} />
        <Route path="/screen-b" element={<ScreenB />} />
      </Routes>
    </Router>
  );
};

const styles = {
  inputQR: {
    margin: "20px 0",
    display: "flex",
    justifyContent: "space-between",
    width: "100",
  },
  inputWrapper: {
    margin: "20px 0",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "300px"
  },
  inputBox: {
    flexGrow: 1,
    marginRight: 20
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  uploadContainer: {
    margin: '10px',
  },
  button: {
    margin: '20px',
    padding: '10px 20px',
    textDecoration: 'none',
    color: 'white',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }, 
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '.2rem', // Similar to 'gap-4'
    padding: '.2rem', // Similar to 'p-4'
  },
  qrCode: {
    width: '4rem',  // Similar to 'w-16'
    height: '4.4rem', // Similar to 'h-16'
    marginRight: '.2rem', // Similar to 'mr-4'
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const, 
  },
  detailText: {
    margin: 0, // Reset default margins
    fontSize: '.6rem', // Similar to 'text-base'
    lineHeight: '.7rem', // Similar to 'leading-6'
  },
  boldText: {
    fontWeight: 'bold', // Similar to 'font-bold'
  }
};

export default App;
