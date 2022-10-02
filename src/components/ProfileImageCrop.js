import {useRef, useState} from "react";
import ReactCrop, {centerCrop, makeAspectCrop, Crop, PixelCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {Form, Button, Container} from "react-bootstrap";
import {UseDebounceEffect} from './ImageCrop/UseDebounceEffect'
import {CanvasPreview} from './ImageCrop/CanvasPreview'
import axios from "axios";

function centerAspectCrop(
    mediaWidth,
    mediaHeight,
    aspect,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

function ProfileImageCrop(){
    const [imgSrc, setImgSrc] = useState('')
    const previewCanvasRef = useRef(null)
    const imgRef = useRef(null)
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const [scale, setScale] = useState(1)
    const [aspect, setAspect] = useState(1 / 1)

    function onSelectFile(e) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined) // Makes crop preview update between images.
            const reader = new FileReader()
            reader.addEventListener('load', () =>
                setImgSrc(reader.result.toString() || ''),
            )
            reader.readAsDataURL(e.target.files[0])
        }
    }

    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    UseDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                CanvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    0,
                )
            }
        },
        100,
        [completedCrop, scale],
    )

    const handleSubmit = () =>{
        console.log(previewCanvasRef.current.toDataURL("image/jpeg", 0.5));
        const data = new FormData();
        data.append('image', previewCanvasRef.current.toDataURL("image/jpeg", 0.5));

        fetch('http://localhost:8080/upload/profile_img',{
            method: 'POST',
            headers:{
                'authorization': localStorage.getItem('accessToken')
            },
            body: data
        })
    }

    return (
        <div className="App">
            <div className="Crop-Controls">
                <input type="file" accept="image/*" onChange={onSelectFile} />
                <div>
                    <label htmlFor="scale-input">Scale: </label>
                    <input
                        id="scale-input"
                        type="number"
                        step="0.1"
                        value={scale}
                        disabled={!imgSrc}
                        onChange={(e) => setScale(e.target.value)}
                    />
                </div>
            </div>
            {imgSrc && (
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        style={{
                            transform: `scale(${scale})`,
                            width: 400,
                            height: 'auto',
                        }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
            <div>
                {completedCrop && (
                    <canvas
                        ref={previewCanvasRef}
                        style={{
                            borderRadius: '50%',
                            border: '1px solid black',
                            width: 300,
                            height: 300,
                        }}
                    />
                )}
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
        </div>
    )
}



export default ProfileImageCrop;