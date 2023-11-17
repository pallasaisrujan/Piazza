const express=require("express")

const app = express()

app.use("/health",(req,res)=>{
    res.status(200).send("OK")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });