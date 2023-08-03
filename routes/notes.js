const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');


//Route 1: Fetch all notes using: GET "/api/notes/fetchallnotes". login require
router.get('/fetchallnotes', fetchUser, async (req, res) =>{
    try {
        const notes = await Notes.find({user: req.user.id})
    res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
      }
})

//Route 2: Add notes using: GET "/api/notes/addnote". login require
router.post('/addnote', fetchUser, [
    body('title', "Enter a valid title").isLength({min: 3}),
    body('description', "Enter a valid description").isLength({min: 5}),
],
async (req, res) =>{
    try {
        const { title, description, tag } = req.body;

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = new Notes({
        title, description, tag, user: req.user.id
    })
    const savedNote = await note.save()

    res.json(savedNote);

    } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

//Route 3: Find notes to update and update it: GET "/api/notes/updatenote". login require
router.put('/updatenote/:id', fetchUser,
async (req, res) =>{
 const {title, description, tag} = req.body;
 try {
    
 
 //Create new note object
 const newNote = {};
 if(title){newNote.title = title}
 if(description){newNote.description = description}
 if(tag){newNote.tag = tag}

 //Find note to update and update it 
 let note = await Notes.findById(req.params.id);
 if(!note){return res.status(404).send("Not Found")}

 if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
 }

 note =  await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
 res.json({note})
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

//Route 4: Find notes to delete and delete it: GET "/api/notes/deletenote". login require
router.delete('/deletenote/:id', fetchUser,
async (req, res) =>{
 const {title, description, tag} = req.body;
try {
 //Find note to delete and delete it 
 let note = await Notes.findById(req.params.id);
 if(!note){return res.status(404).send("Not Found")}

 // Allow deletion only of user owns this note
 if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
 }

 note =  await Notes.findByIdAndDelete(req.params.id)
 res.json({"Sucess": "Note has been deleted", note:note})
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

module.exports = router;