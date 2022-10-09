import {useRef, useState} from "react";
import ReactCrop, {centerCrop, makeAspectCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {Form, Button} from "react-bootstrap";
import {UseDebounceEffect} from './ImageCrop/UseDebounceEffect'
import {CanvasPreview} from './ImageCrop/CanvasPreview'
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import {useNavigate} from "react-router-dom";
import '../resources/css/imageCrop.css';

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

/**
 * Takes an image from an input and allows the user to crop the image on a canvas and submit it to the server
 * @returns {JSX.Element}
 * @constructor
 */
function ProfileImageCrop(){
    const [imgSrc, setImgSrc] = useState('')
    const previewCanvasRef = useRef(null)
    const imgRef = useRef(null)
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const [scale, setScale] = useState(1)
    const [aspect, setAspect] = useState(1 / 1)
    const navigate = useNavigate();

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

    const changeScale = () =>{
        setScale(scale + 0.1)
    }

    const handleSubmit = async () =>{
        const data = new FormData();
        data.append('image', previewCanvasRef.current.toDataURL("image/png", 0.5));

        const response = await fetch('http://localhost:8080/upload/profile_img',{
            method: 'POST',
            headers:{
                'authorization': localStorage.getItem('accessToken')
            },
            body: data
        })
        if(response.status === 202){
            setImgSrc(null);
            setCrop(null);
            setCompletedCrop(null);
            window.location.reload(false);
        }else{

        }

    }

    return (
        <div className="Crop-Container">
            <div className="Crop-Controls">
                <Form.Control type="file" accept="image/*" onChange={onSelectFile} />
            </div>
            {imgSrc && (
                <div className="Crop-View">
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
                    <div className="Crop-Zoom">
                        <Button className="Zoom-Button" onClick={(e) => setScale(scale + 0.1)}><ZoomInIcon/></Button>
                        <Button className="Zoom-Button" onClick={(e) => setScale(scale - 0.1)}><ZoomOutIcon/></Button>
                    </div>
                </div>
            )}
            <div className="Crop-Preview">
                {completedCrop && (
                    <canvas
                        ref={previewCanvasRef}
                        style={{
                            borderRadius: '50%',
                            border: '1px solid black',
                            width: 128,
                            height: 128,
                        }}
                    />
                )}
                {imgSrc && <Button onClick={handleSubmit}>Submit</Button>}
            </div>
        </div>
    )
}



export default ProfileImageCrop;