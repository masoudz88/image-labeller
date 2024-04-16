// import React, { useState } from 'react';
// import { Upload, Button, Input } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import { Layout, Carousel } from 'antd';
// const { Header, Content, Footer } = Layout;

// const FileReaderComponent = () => {
//     const [images, setImages] = useState([]);
//     const [error, setError] = useState('');
  
//     const handleFileChange = async (event) => {
//       const file = event.target.files[0];
//       if (!file) {
//         return;
//       }
  
//       // Reset previous state
//       setImages([]);
//       setError('');
  
//       // Check file type
//       if (file.type === 'image/png') {
//         displayImage(file);
//       } else if (file.name.endsWith('.tar')) {
//         // Here you should implement the logic to handle .tar files
//         // This is a placeholder for where you would untar the file and process the contents
//         setError('Uploading .tar files is not implemented in this example.');
//       } else {
//         setError('Unsupported file type. Please upload a .png or .tar file.');
//       }
//     };

//     const displayImage = (file) => {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           setImages([e.target.result]);
//         };
//         reader.readAsDataURL(file);
//       };

//   return (
//     <div style={{display: 'flex', justifyContent: 'center', marginTop: "15px"}}>
//         <Content style={{ display: 'flex', justifyContent: 'center' }}>
//         <div className="site-layout-content" style={{ width: '50%', height: "40%" }}>
//           <Carousel ref={carouselRef} autoplay={false}>
//             {images && images.map((src, index) => (
//               <div key={index} style={{ display: 'flex', justifyContent: 'center' }}>
//                 <img src={src} alt={`Slide ${index}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
//               </div>
//             ))}
//           </Carousel>
//         </div>
//       </Content>
//       <input type="file" accept=".png,.tar" onChange={handleFileChange} />
//       {error && <div style={{ color: 'red' }}>{error}</div>}
//     </div>
//   );
// };

// export default FileReaderComponent;
