import { useEffect, useRef, useState } from 'react'
import './App.sass'

function App() {
	const canvasRef = useRef(null);
	const canvasRefOutput = useRef(null);
	const canvasRefDownload = useRef(null);
	const canvasRefDownloadModified = useRef(null);

	const [statusOfLoadOfImage, setStatusOfLoadOfImage] = useState(false);
	const [transformedOnce, setTransformedOnce] = useState(false);
	const [downloadedImage, setDownloadedImage] = useState("");
	const [shrinkValue, setShrinkValue] = useState(3);
	const [pathToImage, setPathToImage] = useState("#");
	const [sizeOfCanvasForDownload, setSizeOfCanvasForDownload] = useState({ width: 500, height: 500 });

	useEffect(() => {
		if (!statusOfLoadOfImage || !transformedOnce) return;
		const ctx  = canvasRef.current.getContext("2d", { willReadFrequently: true })
		const ctx2 = canvasRefOutput.current.getContext(("2d"), { willReadFrequently: true });
		for(let i = 0; i < 300; i += shrinkValue) {
			for (let g = 0; g < 300; g += shrinkValue) {
				const pixel = ctx.getImageData(i, g, 1, 1).data;
				const color = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
				ctx2.fillStyle = color;
				ctx2.fillRect(i / shrinkValue * shrinkValue, g / shrinkValue * shrinkValue, shrinkValue, shrinkValue);
			}
		}
	}, [downloadedImage, shrinkValue])

	const imageProcessing = (data) => {
		setTransformedOnce(false);
		setStatusOfLoadOfImage(false);
		const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
		const image = new Image();
		image.src = !data ? "kaguya.png" : URL.createObjectURL(data);
		image.addEventListener("load", () => {
			setStatusOfLoadOfImage(true);
			setTransformedOnce(true);
			setDownloadedImage(image);
			setSizeOfCanvasForDownload({ width: image.width, height: image.height });
			ctx.drawImage(image, 0, 0, 300, 300);
		})
	}

	useEffect(() => {
		imageProcessing();
	}, [])

	const downloadImage = () => {
		if (!statusOfLoadOfImage) return;
		const ctx = canvasRefDownload.current.getContext("2d", { willReadFrequently: true });
		const ctx2 = canvasRefDownloadModified.current.getContext("2d", { willReadFrequently: true });
		const adjustmentRatio = Math.round((downloadedImage.width / 300 + downloadedImage.height / 300) / 2);
		//the main reason to adjust because the preview of image has different size from the input/output, so the output image looks different
		//adjustment above is a weird and rude solution, but for a test project it is enough
		const localShrinkValue = shrinkValue * adjustmentRatio;
		ctx.drawImage(downloadedImage, 0, 0, downloadedImage.width, downloadedImage.height);
		for(let i = 0; i < downloadedImage.width; i += localShrinkValue) {
			for (let g = 0; g < downloadedImage.height; g += localShrinkValue) {
				const pixel = ctx.getImageData(i, g, 1, 1).data;
				const color = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
				ctx2.fillStyle = color;
				ctx2.fillRect(i / localShrinkValue * localShrinkValue, g / localShrinkValue * localShrinkValue, localShrinkValue, localShrinkValue);
			}
		}
		const path = canvasRefDownloadModified.current.toDataURL("image/png");
		setPathToImage(path);
	}

	return (
			<div className="App">

				<canvas className="hiddenCanvas" ref={canvasRefDownload} width={sizeOfCanvasForDownload.width} height={sizeOfCanvasForDownload.height}></canvas>
				<canvas className="hiddenCanvas" ref={canvasRefDownloadModified} width={sizeOfCanvasForDownload.width} height={sizeOfCanvasForDownload.height}></canvas>

				<div className="canvasArea">
					<canvas className="canvasImage" ref={canvasRef} width={300} height={300}></canvas>
					<canvas className="canvasImage" ref={canvasRefOutput} width={300} height={300}></canvas>
				</div>
				<div className="menu">
					<label className="btn" htmlFor="inputImage">Choose image</label>
					<input id="inputImage" type="file" accept="image/*" onChange={(e) => {imageProcessing(e.target.files[0])}}/>
					<div className="wrap">
						<label className="info-label" htmlFor="inputShrinkValue">Handle shrink</label>
						<input id="inputShrinkValue" type="range" min={3} max={10} value={shrinkValue} onChange={(e) => setShrinkValue(+e.target.value)}/>
					</div>
				</div>
				<a href={pathToImage} download={transformedOnce}>
					<button onClick={downloadImage} className="btn" disabled={!transformedOnce}>Download image</button>
				</a>
			</div>
	)
}

export default App
