
import {Box} from "@mui/material"
import { useEffect,useState } from 'react'
import Quill from "quill"
import toolbarOptions from "../assets/contants"
import  "quill/dist/quill.snow.css"
import {io} from "socket.io-client"
import { useParams } from "react-router-dom"


const Editor = () => {

  const[socket,setSocket]=useState();
  const[quill,setQuill]=useState();
  const {id}=useParams();
  useEffect(()=>{
    const QuillServer=new Quill("#container",{theme:"snow", modules:{toolbar:toolbarOptions}})
   
    QuillServer.disable();
    QuillServer.setText('Loading the document...')
    setQuill(QuillServer)
  },[])

useEffect(()=>{
  const scoketServer=io("http://localhost:9000")
  setSocket(scoketServer)
  return()=>{
    scoketServer.disconnect();
  }
},[])

useEffect(()=>{
  if (socket === null || quill === null)
    return;



  const handleChange = (delta, oldData, source)=>{

   
    if (source != 'user')
      return;

    socket&& socket.emit('send-changes', delta);
  }
    quill && quill.on('text-change',handleChange)

    return () => {
      quill && quill.off('text-change')
    }
  

},[quill,socket])

  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleChange = (delta) => {
      quill.updateContents(delta);
    }

    socket && socket.on('receive-changes', handleChange);

    return () => {
      socket && socket.off('receive-changes', handleChange);
    }


  }, [quill, socket])

  useEffect(()=>{
    if(quill==null|| socket===null)
    return;

    socket &&socket.once('load-document',document=>{
      quill && quill.setContents(document);
      quill && quill.enable();
    })

    socket&& socket.emit('get-document',id);



  },[quill,socket,id])


  useEffect(() => {
    if (socket === null || quill === null) return;

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, 2000);

    return () => {
      clearInterval(interval);
    }
  }, [socket, quill]);
  return (
    <Box sx={{bgcolor:"#f5f5f5"}} >
      <Box className="container" id="container"></Box>



    </Box>
   
  )
}

export default Editor
