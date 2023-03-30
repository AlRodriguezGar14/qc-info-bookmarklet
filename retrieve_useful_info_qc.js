// Get useful information from the QC page

javascript:(function() {
  let html = document.documentElement.outerHTML;
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, 'text/html');

  let title = doc.querySelector('h1.page-header.top').textContent.trim();
  let url = window.location.href;

  let sku = null;
  let owner = null;

  const dtElements = doc.querySelectorAll("dt");
  dtElements.forEach((dtElement) => {
    const ddElement = dtElement.nextElementSibling;
    const textContent = dtElement.textContent.trim();

    if (textContent === "SKU") {
      sku = ddElement.textContent.trim();
    } else if (textContent === "Owner") {
      owner = ddElement.textContent.trim();
    } 
  });

  let new_title = title.replace(/ /g, '_').replace(/'/g, '_').replace(/&(?=\s)/g, '').replace(/&/g, '_').replace(/[.,]/g, '').replace(/_+/g, '_').toLowerCase() + '/';
  let sku_title = sku + '_' + new_title;
  let to_obsidian = '['+ title +'](' + url + ') - ' + sku;

  let videoUrls = $('a[data-src]').map(function() {
    return $(this).data('src');
  }).get().filter(function(url) {
    return /\.mp4$/.test(url);
  });

  let dialogContainer = document.createElement("div");
  dialogContainer.style.position = "fixed";
  dialogContainer.style.top = "50%";
  dialogContainer.style.left = "50%";
  dialogContainer.style.transform = "translate(-50%, -50%)";
  dialogContainer.style.backgroundColor = "#fff";
  dialogContainer.style.border = "1px solid #ccc";
  dialogContainer.style.padding = "20px";
  dialogContainer.style.zIndex = "9999";

  let messageEl = document.createElement("div");
  messageEl.innerHTML = sku_title 
    + '\n\n' 
    + 'owner: ' + owner 
    + '\n\n'
    + to_obsidian
    + '\n\n';
  
  
  messageEl.innerHTML += 'Apple search:\n'
    + '/usr/local/itms/bin/iTMSTransporter -u $TRANSPORTER_USER -p $TRANSPORTER_PASSWORD -s KinonationInc -m status -vendor_id ' + sku
    + '\n\n'
    + 'Apple standard download\n'
    + 'aws --profile production s3 sync s3://kinonation-deliverybucket-1ss0x1mb9657c/apple/' + sku_title + ' ' + sku_title;

  messageEl.style.marginBottom = "10px";
  messageEl.style.whiteSpace = "pre-wrap";

  dialogContainer.appendChild(messageEl);


  if (videoUrls.length > 0) {
    let videoLinksEl = document.createElement("div");
    videoLinksEl.style.marginTop = "10px";
    messageEl.appendChild(videoLinksEl);

    $('h4.panel-title').each(function(index, element) {
      if ($(this).find('a[role="button"]').text().trim() === "Main") {
        let videoLinkEl = document.createElement("a");
        videoLinkEl.innerText = $(this).find('a[role="button"]').text().trim() + " " + $(this).find('a[data-src]').data('src');
        videoLinkEl.href = $(this).find('a[data-src]').data('src');
        videoLinkEl.style.display = "block";
        videoLinkEl.style.marginTop = "10px";
        videoLinksEl.appendChild(videoLinkEl);
      }
    });
  }


  let copyBtnEl = document.createElement("button");
  copyBtnEl.innerHTML = "Copy";
  copyBtnEl.style.marginRight = "10px";
  copyBtnEl.onclick = function() {
    let range = document.createRange();
    range.selectNode(messageEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();

    alert("Text copied to clipboard.");
  };
  dialogContainer.appendChild(copyBtnEl);

  let closeBtnEl = document.createElement("button");
  closeBtnEl.innerHTML = "Close";
  closeBtnEl.onclick = function() {
    document.body.removeChild(dialogContainer);
  };
  dialogContainer.appendChild(closeBtnEl);

  document.body.appendChild(dialogContainer);
})();
