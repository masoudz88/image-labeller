import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Select, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import classesData from './classes.json';
import untar from 'js-untar';

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const App = () => {
  const [labels, setLabels] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const classLabels = classesData.fruits.map(fruit => fruit.class);
    setLabels(classLabels);
  }, []);

  const displayImage = (file) => {
    const url = URL.createObjectURL(file);
    setImages(prevImages => [...prevImages, { src: url, label: selectedLabel }]);
    setSelectedImage({ src: url, label: selectedLabel });
  };

  const untarFile = async (file) => {
    const reader = new FileReader();
    setImages([]);
    reader.onload = async (e) => {
      try {
        const untarredFiles = await untar(e.target.result);
        const imagePromises = untarredFiles
          .filter(file => file.name.endsWith('.png'))
          .map(async file => {
            const blob = new Blob([file.buffer], { type: 'image/png' });
            return { src: URL.createObjectURL(blob), label: selectedLabel };
          });

        const imageUrls = await Promise.all(imagePromises);
        setImages(prevImages => [...prevImages, ...imageUrls]);
        if (!selectedImage && imageUrls.length > 0) {
          setSelectedImage(imageUrls[0]);
        }
      } catch (err) {
        setError('Error processing .tar file.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLabelChange = (value) => {
    setSelectedLabel(value);
  };

  return (
    <Layout className="layout" style={{ minHeight: '60vh', display: 'flex' }}>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
          <Menu.Item key="1">Image Labeler</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ display: 'flex', marginTop: 20, flexGrow: 1 }}>
        <div style={{ paddingLeft: 20, width: '200px', height: 'calc(60vh - 85px)', overflowY: 'auto', borderRight: '1px solid #f0f0f0' }}>
          {images.map((image, index) => (
            <img key={index} src={image.src} alt={`Slide ${index}`} onClick={() => setSelectedImage(image)} style={{ width: '100%', cursor: 'pointer', marginBottom: '10px' }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {selectedImage && (
            <>
              <div style={{ position: 'absolute', top: 10, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px' }}>
                {selectedLabel || 'No label'}
              </div>
              <img src={selectedImage.src} alt="Selected" style={{ border: selectedLabel? '4px solid yellow' : "none", maxWidth: '80%', maxHeight: '80%' }} />
            </>
          )}
        </div>
      </Content>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 15 }}>
        <Upload.Dragger
          name="file"
          accept=".png,.tar"
          beforeUpload={(file) => {
            const isPNG = file.type === 'image/png';
            const isTAR = file.name.endsWith('.tar');
            
            if (!isPNG && !isTAR) {
              message.error('Unsupported file type. Please upload a .png or .tar file.');
              return Upload.LIST_IGNORE;
            }

            if (isPNG) {
              setImages([])
              displayImage(file);
              setSelectedLabel("");
            } else if (isTAR) {
              untarFile(file);
            }
            return false;
          }}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single upload of .png or .tar files.
          </p>
        </Upload.Dragger>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </div>

      <Footer style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div>
          Label: 
          <Select defaultValue="Select a label" style={{ width: 120, marginLeft: 10 }} onChange={handleLabelChange}>
            {labels.map((item, index) => (
              <Option key={index} value={item}>{item}</Option>
            ))
            }
          </Select>
          
        </div>

        <div style={{marginTop: 15}}>
          <Button type="primary" style={{ background: 'black', borderColor: 'black', marginLeft: 10 }} onClick={() => console.log('Submit')}>
            Submit
          </Button>
          <Button style={{ marginLeft: 10, color: 'black', borderColor: 'black', background: 'white' }} onClick={() => console.log('Cancel')}>
            Cancel
          </Button>
        </div>
      </Footer>
    </Layout>
  );
};

export default App;
