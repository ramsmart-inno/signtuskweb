export let basePdfUrl = '';
export let base64Document = '';
export let base64Image = '';

export let imageDimensionss = { width: 0, height: 0 };

export let whichWay = 0;

export let signerName = 'Veeramani No 1';

export const updateImageDimensions = (width : number, height: number) => {
  imageDimensionss = { width, height };
};

export const updateWhichWay = (newWay: number) => {
  whichWay = newWay;
};

// Functions to update the variables dynamically
export const updateSignerName = (newPdfUrl: string) => {
  signerName = newPdfUrl;
};


// Functions to update the variables dynamically
export const updateBasePdfUrl = (newPdfUrl: string) => {
    basePdfUrl = newPdfUrl;
  };
  
export const updateBaseImageUrl = (newImageUrl: string) => {
    base64Image = newImageUrl;
  };

export const templateSchemas = [
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
      content: 'data:image/png;base64,iVB...',
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
];
