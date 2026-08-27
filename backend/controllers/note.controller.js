import Note from "../models/note.model.js";



export const  createNotes=async(req,res)=>{
    try{
        const {title,content}=req.body;
        if(!title || !content){
            return res.status(400).json({message:"Title and Content are required"});
        } 
        const NewNote = new Note({title,content})
        await NewNote.save();
        res.status(201).json(NewNote);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}



export const getNotes=async(req,res)=>{
    try{
       const notes = await Note.find().sort({createdAt:-1});
       res.status(200).json(notes); 
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

export const updateNote=async(req,res)=>{
    try{
        const {titile,content}=req.body;
        const updatedNote = await Note.findByIdAndUpdate(req.params.id,{titile,content},{new:true});
        if(!updatedNote){
            return res.status(404).json({message:"No changes found"});
        }
        res.status(200).json(updatedNote);

    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}


export const deleteNote=async(req,res)=>{
    try{
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if(!deletedNote){
            return res.status(404).json({message:"No note found"});
        }
        res.status(200).json({message:"Note deleted successfully"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}