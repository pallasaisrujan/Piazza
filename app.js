const express=require("express")

const app = express()

app.use("/health",(req,res)=>{
    res.status(200).send("OK")
})

app.listen("8000", () => {
    console.log(`Server is running on port 8000`);
  });