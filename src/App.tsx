// Main Index.js or App.js

import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Designer } from '@pmee/ui';
import { Template, Font } from '@pmee/common';
import { text, image, barcodes, dateTime } from '@pmee/schemas';
import { generatePDF } from './helper';
import './App.css';
import { toPng } from 'html-to-image';
import { base64Image, basePdfUrl, base64Document, updateBaseImageUrl, updateBasePdfUrl, updateImageDimensions, imageDimensionss, updateSignerName, signerName } from './variables';
import QRCodeStyling, { DrawType, TypeNumber, Mode, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType, FileExtension, Options } from "qr-code-styling";
import { useToPng } from '@hugocxl/react-to-image'
import { Col, Row } from 'antd';

// Main Screen
const MainScreen = () => {
  const [base64Pdf, setBase64Pdf] = useState<string>('');
  const [imgSrc, setImgSrc] = useState<string>('');
  const [imgCardSrc, setCardImgSrc] = useState<string>('');
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
    margin: 1,
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
      color: '#FFFFFF',
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
  const ref = useRef(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });


  useEffect(() => {
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      updateImageDimensions(width, height);
      setDimensions({ width, height });
    }
  }, [cardRef]);  // This effect runs when the component mounts and when `reff` changes


  const [_, convert, reff] = useToPng<HTMLDivElement>({
    quality: 0.8,
    onSuccess: data => {
      const link = document.createElement('a');
      link.download = 'my-image-name.jpeg';
      link.href = data;
      link.click();
    }
  })


  useEffect(() => {
    const generateImage = async () => {
      if (ref.current) {
        qrCode.append(ref.current);

        try {
          // Generate PNG from the QR code and update state
          const dataUrl = await toPng(ref.current, { width: 300, height: 300 });
          setImgSrc(dataUrl);
        } catch (error) {
          console.error("Failed to generate QR code image:", error);
        }
      }
    };

    generateImage();
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode.update(options);
  }, [qrCode, options]);

  const handleGenerateStamp = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { width: maxTextWidth + 60, height: 100, backgroundColor: 'rgba(0, 0, 0, 0)' });
        setCardImgSrc(dataUrl);  // Set the generated PNG
        console.log(dataUrl.toString());
        console.log(dataUrl.length);

        updateBaseImageUrl("data:image/png;" + dataUrl)
      } catch (error) {
        console.error("Failed to generate image:", error);
      }
    }
  };

  const onDataChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (ref.current) {
      const dataUrl = await toPng(ref.current, { width: 300, height: 300 }); // Convert ref to an image
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

  function getTextWidth(text: string, font = '16px Arial') {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      // Fallback if context is null
      console.error("Unable to get canvas context");
      return 0;
    }

    context.font = font;
    return context.measureText(text).width;
  }

  const maxTextWidth = Math.max(
    getTextWidth("Signed by: Alice"),
    getTextWidth("alice@example.com"),
    getTextWidth("+00 00000 00000"),
    getTextWidth("2021-06-24 08:00:00 CEST"),
    getTextWidth("https://example.com")
  );

  const calculatedWidth = `${Math.min(maxTextWidth + 6, 300)}px`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSignerName(e.target.value);
};

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Main Screen</h1>
      <Row>
        <Col>
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
        </Col>


        <Col>
        <div>
          <button onClick={handleGenerateStamp}>Generate Stamp</button>
          <button onClick={convert}>Download</button>
          <div ref={cardRef} style={{ padding: "20px", background: "#fff" }}>
            <div ref={reff} style={{
              ...styles.row, width: calculatedWidth,   // Adjust width
              height: "auto",
              padding: "6px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}>
              <img src={imgSrc || "https://placehold.co/100x100"} alt="QR code" style={{
                ...styles.qrCode,
                width: "60px",  // Fixed size
                height: "60px",
              }} />
              <div style={styles.details}>
                <p style={{ ...styles.detailText, ...styles.boldText }}>
                  Signed by: Alice
                </p>
                <p style={{ ...styles.detailText, ...styles.boldText }}>
                  alice@example.com
                </p>
                <p style={{ ...styles.detailText, ...styles.boldText }}>
                  +00 00000 00000
                </p>
                <p style={styles.detailText}>2021-06-24 08:00:00 CEST</p>
                <p style={styles.detailText}>https://example.com</p>
              </div>
            </div>
          </div>

          {/* <div>
          <img src={imgSrc || "https://placehold.co/100x100"} alt="QR code" style={{
              ...styles.qrCode,
              width: "60px",  // Fixed size
              height: "60px",
            }} />
            <ReactCurvedText
            width={370}
            height={300}
            cx={196}
            cy={204}
            rx={100}
            ry={100}
            startOffset={20}
            reversed={true}
            text="ReactScriptComReactScript"
            textProps={{ style: { fontSize: '25' } }}
            tspanProps={{ dy: '-20' }}
          />

        </div> */}

          {imgCardSrc && (
            <div>
              <img src={imgCardSrc || "https://placehold.co/100x100"} alt="Generated Stamp" />
            </div>
          )}
        </div>

        <h3>Signer Name:</h3>
        <input name="myInput" onChange={handleInputChange}/>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Link to="/screen-a" style={styles.button}>
            Go to Screen A (PDF Designer)
          </Link>
          <Link to="/screen-b" style={styles.button}>
            Go to Screen B
          </Link>
        </div>
        </Col>
      </Row>
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
              width: 40,
              height: 16,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<Designer | null>(null);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    const font: Font = {
      serif: {
        data: 'http://fonts.gstatic.com/s/abhayalibre/v1/wBjdF6T34NCo7wQYXgzrc_qsay_1ZmRGmC8pVRdIfAg.ttf',
        fallback: true,
      },
      seriff: {
        data: 'http://fonts.gstatic.com/s/abhayalibre/v1/zTLc5Jxv6yvb1nHyqBasVy3USBnSvpkopQaUR-2r7iU.ttf',
      },
    };

    

    if (containerRef.current) {
      const template: Template = {
        basePdf: base64Document, // Replace with your base PDF data URL
        schemas: [
          [
            {
              name: 'Text',
              type: 'text',
              position: {x: 85.71, y: 209.22},
              content: signerName,
              width: 81.44,
              height: 6.09,
              alignment: "center",
              verticalAlignment: "middle",
              fontName:'serif',
              fontSize: 12
            },
            {
              name: 'photo',
              type: 'image',
              content: base64Image,
              position: { x: 130.29, y: 251.67 },
              width: 60,
              height: 24,
            },
            {
              name: 'Textee',
              type: 'text',
              position: {
                x: 32.27,
                y: 232.94
              },
              content: signerName,
              width: 65.04,
              height: 6.09,
              alignment: "center",
              verticalAlignment: "middle",
              fontName:'serif',
              fontSize: 12
            }
          ],
        ],
      };



      const designer = new Designer({
        domContainer: containerRef.current,
        template,
        options:{
          font
        },
        plugins: {
          text,
          image,
          dateTime,
          qrcode: barcodes.qrcode,
        },
      });

      designer.updateOptions({ font });

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
    alignItems: 'flex-start',    // Align items to the start of the cross-axis
    justifyContent: 'flex-start'
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
