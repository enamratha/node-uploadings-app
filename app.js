const express = require("express");
const multer = require("multer");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const databasePath = path.join(__dirname, "userUploadings.db");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

let database = null;

// const upload = multer({ dest: 'uploads/' })

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/", (req, res) => {
  return res.render("homepage");
});

app.post("/upload", upload.single("profileImage"), async (req, res) => {
  console.log("hi");
  const fileDetails = req.file;
  const { filename } = fileDetails;
  const { name, socialMediaHandle } = req.body;
  const postUploading = `
      INSERT INTO
      uploads( name, username, image)
      VALUES
      ('${name}', '${socialMediaHandle}', '${filename}');`;
  await database.run(postUploading);
  return res.redirect("/");
});

app.get("/uploads/:name", async (req, res) => {
  const { name } = req.params;
  const source = `/uploads/${name}`;
  const imgPath = path.join(__dirname, source);
  res.sendFile(imgPath);
});

app.get("/uploads", async (req, res) => {
  const allUploadsQuery = `
        SELECT * 
        FROM uploads;
    `;
  const allUploads = await database.all(allUploadsQuery);
  res.send(allUploads);
});

export default app;
