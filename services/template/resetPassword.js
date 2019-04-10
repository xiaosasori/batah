module.exports = args => {
  return `
  <html>
  <body>
    <div style="text-align: center;">
      <div>
        <img src="https://imgur.com/YKNIcwn.png">
      </div>
      <h3>We received your request to reset password of an account registered with email ${args.email}</h3>
      <p>Here is the <a href="${args.resetLink}">link</a> to reset your password. This will expired in 
        <b style="color:red">1 hour</b>
      </p>
    </div>
  </body>
</html>
`
}