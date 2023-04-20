const express = require('express');
const router =  express.Router();
const fetchuser = require('../middleware/getuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
router.get('/fetchnotes',fetchuser,async (req,res) => {
    try {
        const notes =await Notes.find({user:req.user.id});
        if(notes.length>0)
        {res.json(notes);}
        else
        {res.json({message:"no notes"});}
        
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err})
    }
})

router.post('/addnotes', fetchuser,[
    body('title','title must be of 3 character').isLength({ min: 3 }),
    body('description','description must be of 5 character').isLength({ min: 5 })
], async (req, res)=>{
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const {title, description ,tag} = req.body;
        if(tag.length === 0) {
            const notes = new Notes({title, description,user:req.user.id});
            const savedNotes= await notes.save();
            res.json(savedNotes);
        }
        else{

            const notes = new Notes({title, description,tag,user:req.user.id});
            const savedNotes= await notes.save();
            res.json(savedNotes);
        }
    } 
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err})
    }
})
router.put('/updatenote/:id', fetchuser,async (req, res)=>{
    try {
        
    
       const {title, description ,tag}= req.body;
       const newNotes ={};
       if(title) {newNotes.title = title};
       if(description) {newNotes.description = description};
       if(tag) {newNotes.tag = tag};
       let notes= await Notes.findById(req.params.id);
    //    console.log(notes);
       if(!notes) {
           res.status(404).send("Not Found");
       }
    //    console.log(notes.user.toString());
       if(notes.user.toString() !== req.user.id)
       {res.status(401).send("Not Allowed")}
       notes=await Notes.findByIdAndUpdate(req.params.id,{$set:newNotes},{new:true});
       res.send(notes);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err})
    }

});
router.delete('/deletenote/:id', fetchuser,async (req, res)=>{
    try {
       let notes= await Notes.findById(req.params.id);
    //    console.log(notes);
       if(!notes) {
           res.status(404).send("Not Found");
       }
    //    console.log(notes.user.toString());
       if(notes.user.toString() !== req.user.id)
       {res.status(401).send("Not Allowed")}
       notes=await Notes.findByIdAndDelete(req.params.id);
       res.json({message:"Sucess note deleted",notes})
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: err})
    }

});

module.exports = router;