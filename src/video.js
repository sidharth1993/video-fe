import React, {useRef, useEffect, useState} from 'react';

const constraints = {
    video : true,
    audio : true
}

let connection = null;

const Video = ()=>{
    const videoPlayer = useRef();
    const displayPlayer = useRef();
    const [users, setUsers] = useState(1);

    const connectWS = ()=>{
        let queryParams = window.location.search;
        if(queryParams){
            queryParams = queryParams.split('&');
            let mId = queryParams[0].slice(queryParams[0].indexOf('=')+1,queryParams[0].length);
            let usr = queryParams[1].slice(queryParams[1].indexOf('=')+1,queryParams[1].length);
            //connection = new WebSocket(`ws://127.0.0.1:4000/?mid=${mId}&user=${usr}`);
            connection = new WebSocket(`ws://video-socket-be.herokuapp.com/?mid=${mId}&user=${usr}`);
        }
    }

    useEffect(()=>{
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
            connectWS();
            videoPlayer.current.srcObject = stream;
            if(connection){
                connection.onmessage = (message)=>{
                    //let data = JSON.parse(message.data);
                    displayPlayer.current.src = message.data;
                    //data.msg;
                    /* if(data.usr === 1){
                        videoPlayer.current.classList = "onlyvideo";
                    }else{
                        displayPlayer.current.src = data.msg;
                    } */
                }
                connection.onclose = e => {
                    console.log(`CLosing connection --> ${e}`);
                };
                connection.onopen = (open)=>{
                    let interval = setInterval(()=>{
                        if(connection && connection.readyState === 1){
                            let canvas = document.createElement('canvas');
                            canvas.height = videoPlayer.current.videoHeight;
                            canvas.width = videoPlayer.current.videoWidth;
                            canvas.getContext('2d').drawImage(videoPlayer.current,0,0);
                            const data = canvas.toDataURL('image/jpeg',0.70);
                            connection.send(data);
                        }else{
                            clearInterval(interval);
                            connectWS();
                        }
                    },100);
                }
            }
        })
    },[]);

    return (
        <>
            <video ref={videoPlayer} autoPlay ></video>
            <img ref={displayPlayer}></img>
        </>
    );    
      
}

export default Video;