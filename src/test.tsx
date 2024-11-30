import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Designer } from '@pmee/ui';
import { text, image, barcodes, dateTime } from '@pmee/schemas';
import type { Template } from '@pmee/common';
import { generatePDF } from './helper';



function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<Designer | null>(null);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    
    if (containerRef.current) {
      // Define your template for the PDF Designer
      const template: Template = {
        basePdf: 'data:application/pdf;base64,JV...', // Replace with your base PDF data URL
        schemas: [
         [ {
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
            name: "photo",
            type: "image",
            content: "data:image/png;base64,iVB...",
            position: {
              "x": 24.99,
              "y": 65.61
            },
            width: 60.66,
            height: 93.78
          },
          {
            name: "dateTime",
            type: "dateTime",
            position: { "x": 50, "y": 200 },
            width: 45,
            height: 10,
            readOnly:false,
            format: "yyyy/MM/dd HH:mm",  // DateTime format
            placeholder: "Select Date and Time",
            content: "2024/11/19 13:28",
            
          }
        
        ]
        ],
      };

      // Initialize the Designer
      const designer = new Designer({
        domContainer: containerRef.current,
        template,
        plugins:{
          text,
          image,
          dateTime,
          qrcode: barcodes.qrcode,
        },
        options: {
          // labels: {
          //   fieldsList: '入力項目一覧ビュー', // override the label for the edit button
          //   youCanCreateYourOwnLabel: '独自のラベルを作成できます', // add a new label for the custom plugin
          // },
        },
      });

      // Store the Designer instance in the ref
      designerRef.current = designer;

      // Optional: Log the initial template fields
      console.log('Initial Template:', designer.getTemplate());

      setFields(template.schemas);

      return () => {
        designer.destroy(); // Clean up the designer instance on unmount
        designerRef.current = null;
      };
    }
  }, []);

  // Function to get all fields from the Designer
  const handleGetAllFields = () => {
    if (designerRef.current) {
      const currentTemplate = designerRef.current.getTemplate();
      setFields(currentTemplate.schemas); // Update state with the latest fields
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
}
export default App;

