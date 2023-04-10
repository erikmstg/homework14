import nc from "next-connect";

const handler = nc({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
});
handler
  .get((req, res) => {
    res.send("Hello world");
  })
  .post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const { password: passwordDB, ...user } = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      res.json({ user });
    } catch (err) {
      res.status(400).json({ message: "User already exists" });
    }
  })
  .post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      res.json({ token });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: "Invalid credentials" });
    }
  })

  .put(async (req, res) => {
    res.end("async/await is also supported!");
  })

  .patch(async (req, res) => {
    throw new Error("Throws me around! Error can be caught and handled.");
  });

export default handler;
