// import React, { useEffect, useRef, useState } from 'react';
// import './App.css';
// import { Designer } from '@pmee/ui';
// import { text, image, barcodes, dateTime } from '@pmee/schemas';
// import type { Template } from '@pmee/common';
// import { generatePDF } from './helper';

// import { basePdfUrl, base64Image, templateSchemas } from './variables';

// function App() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const designerRef = useRef<Designer | null>(null);
//   const [fields, setFields] = useState<any[]>([]);

//   useEffect(() => {
    
//     if (containerRef.current) {
//       // Define your template for the PDF Designer
//       const template: Template = {
//         basePdf: basePdfUrl, // Replace with your base PDF data URL
//         schemas: [
//          [ {
//             name: 'Text',
//             type: 'text',
//             position: { x: 100, y: 60 },
//             content: 'aeafeafeaefsefsfs',
//             width: 10,
//             height: 10,
//           },
//           {
//             name: 'qrCode',
//             type: 'qrcode',
//             content: 'https://pdfme.com/',
//             position: { x: 100, y: 70 },
//             width: 30,
//             height: 30,
//             rotate: 0,
//           },
//           {
//             name: "photo",
//             type: "image",
//             content: base64Image,
//             position: {
//               "x": 24.99,
//               "y": 65.61
//             },
//             width: 60.66,
//             height: 93.78
//           },
//           {
//             name: "dateTime",
//             type: "dateTime",
//             position: { "x": 50, "y": 200 },
//             width: 45,
//             height: 10,
//             readOnly:false,
//             format: "yyyy/MM/dd HH:mm",  // DateTime format
//             placeholder: "Select Date and Time",
//             content: "2024/11/19 13:28",
            
//           }
        
//         ]
//         ],
//       };

//       // Initialize the Designer
//       const designer = new Designer({
//         domContainer: containerRef.current,
//         template,
//         plugins:{
//           text,
//           image,
//           dateTime,
//           qrcode: barcodes.qrcode,
//         },
//         options: {
//           // labels: {
//           //   fieldsList: '入力項目一覧ビュー', // override the label for the edit button
//           //   youCanCreateYourOwnLabel: '独自のラベルを作成できます', // add a new label for the custom plugin
//           // },
//         },
//       });

//       // Store the Designer instance in the ref
//       designerRef.current = designer;

//       // Optional: Log the initial template fields
//       console.log('Initial Template:', designer.getTemplate());

//       setFields(template.schemas);

//       return () => {
//         designer.destroy(); // Clean up the designer instance on unmount
//         designerRef.current = null;
//       };
//     }
//   }, []);

//   // Function to get all fields from the Designer
//   const handleGetAllFields = () => {
//     if (designerRef.current) {
//       const currentTemplate = designerRef.current.getTemplate();
//       setFields(currentTemplate.schemas); // Update state with the latest fields
//       console.log('All Template Fields:', currentTemplate.schemas);
//     }
//   };





//   return (
//     <div className="App">

//     <button onClick={handleGetAllFields} style={{ marginBottom: '20px' }}>
//         Get All Template Fields
//       </button>
//       <button onClick={() => generatePDF(designerRef.current)} style={{ marginBottom: '20px' }}>
//         Download PDF
//       </button>

//       <div
//         ref={containerRef}
//         style={{ width: '100%', height: '80vh', border: '1px solid #ccc' }}
//       ></div>
//       <div style={{ marginTop: '20px' }}>
//         <h3>Current Fields:</h3>
//         <pre>{JSON.stringify(fields, null, 2)}</pre>
//       </div>
//     </div>
//   );
// }
// export default App;


// Main Index.js or App.js

import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Designer } from '@pmee/ui';
import { text, image, barcodes, dateTime } from '@pmee/schemas';
import { generatePDF } from './helper';
import './App.css';
import { base64Image, basePdfUrl, updateBaseImageUrl, updateBasePdfUrl} from './variables';

// Main Screen
const MainScreen = () => {
  const [base64Pdf, setBase64Pdf] = useState<string>('');
  const [base64Image, setBase64Image] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;

        if (type === 'pdf') {
          setBase64Pdf(base64String);
          updateBasePdfUrl(base64String); // Update variable
        } else if (type === 'image') {
          setBase64Image(base64String);
          updateBaseImageUrl(base64String); // Update variable
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
              width: 60.66,
              height: 93.78,
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
};

export default App;
