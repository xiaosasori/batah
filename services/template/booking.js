module.exports = args => {
  return `
  <html>
  <body>
    <div style="text-align: center;">
      <div>
        <img src="https://imgur.com/YKNIcwn.png">
      </div>
      <h3>Your transaction has been proceeded</h3>
      <p>Batah has received your booking on <b>${args.title}</b></p>
      <div>
        <a href="${args.redirectDomain}">Invoice Detail</a>
      </div>
    </div>
  </body>
</html>
`
}