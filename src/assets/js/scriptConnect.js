let isUpdate, updateId;
const notesContainer = document.querySelector("main"),
  popupBoxConnect = document.querySelector(".connect-popup-box"),
  popupBoxGestion = document.querySelector(".gestion-popup-box"),
  titleTagConnect = popupBoxConnect.querySelector("#titleConnect"),
  descTagConnect = popupBoxConnect.querySelector("textarea"),
  darken = document.querySelector('.darken'),
  switchElement = document.querySelector('.switch'),
  couleurs = document.querySelectorAll('.couleurs span');

const showNotesConnect = async () => {
  const response = await fetch("/projets/notes/assets/php/getNotes.php", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  const data = await response.json(),
    converter = new showdown.Converter({
      tasklists: true,
      smoothLivePreview: true,
      extensions: [taskListEnablerExtension]
    });
  const notesHtml = data.map((row) => {
    let { id, title, couleur, desc, date, hidden } = row;
    desc == false ? desc = "" : desc = desc;
    const descFilter = replaceAllStart(desc),
      s = hidden === 0 ? `<div id="note${id}" tabindex="0" class="note ${couleur}"><div class="details"><p class="title">${title}</p><span>${replaceAllEnd(converter.makeHtml(descFilter))}</span></div><div class="bottom-content"><i title="Date (GMT)" class="fa-solid fa-calendar-days"></i><span>${date}</span><i class="fa-solid fa-pen" tabindex="0" onclick="updateNoteConnect(${id},'${title}','${replaceAllEnd(descFilter)}','${couleur}','${hidden}')"></i><i class="fa-solid fa-clipboard" tabindex="0" onclick="copy('${replaceAllEnd(descFilter)}')"></i><i class="fa-solid fa-trash-can" tabindex="0" onclick="deleteNoteConnect(${id},'${title}')"></i><i class="fa-solid fa-expand" tabindex="0" onclick="toggleFullscreen(${id})"></i></div></div>` : `<div id="note${id}" tabindex="0" class="note ${couleur}"><div class="details"><p class="title">${title}</p><span>*****</span></div><div class="bottom-content"><i title="Date (GMT)" class="fa-solid fa-calendar-days"></i><span>${date}</span><i class="fa-solid fa-pen" tabindex="0" onclick="updateNoteConnect(${id},'${title}','${replaceAllEnd(descFilter)}','${couleur}','${hidden}')"></i><i class="fa-solid fa-trash-can" tabindex="0" onclick="deleteNoteConnect(${id},'${title}')"></i></div></div>`;
    return s;
  }).join("");
  notesContainer.insertAdjacentHTML("beforeend", notesHtml);
};

const fetchDelete = async (e) => {
  fetch("/projets/notes/assets/php/deleteNote.php", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "noteId=" + encodeURIComponent(e)
  })
    .then(response => {
      if (response.ok) {
        document.querySelectorAll(".note").forEach((note) => {
          note.remove();
        });
        darken.classList.remove("show");
        document.body.classList.remove('noscroll');
        showNotesConnect();
      }
    })
};

const deleteAccount = async () => {
  fetch("/projets/notes/assets/php/deleteAccount.php", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(response => {
      if (response.status === 200) {
        location.reload();
      } else {
        if (!window.location.pathname.endsWith('en.php')) {
          alert("Une erreur est survenue lors de la suppression de votre compte...");
        } else {
          alert("An error occurred while deleting your account...");
        }
      }
    })
};

const fetchLogout = async () => {
  fetch("/projets/notes/assets/php/logout.php", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
    .then(response => {
      if (response.status === 200) {
        location.reload();
      }
    })
};

function replaceAllStart(e) {
  return e.replaceAll("<br /><br />", "\n\n").replaceAll("<br />", "\n");
}

function replaceAllEnd(e) {
  return e.replaceAll("\n\n", "<br /><br />").replaceAll("\n", "<br />");
}

function toggleFullscreen(id) {
  const note = document.querySelector('#note' + id);
  note.classList.toggle('fullscreen');
  darken.classList.toggle('show');
  document.body.classList.toggle('noscroll');
}

function updateNoteConnect(id, title, descFilter, couleur, hidden) {
  const notes = document.querySelectorAll('.note');
  notes.forEach(note => {
    note.classList.remove('fullscreen');
  });
  darken.classList.remove("show");
  document.body.classList.add('noscroll');
  isUpdate = true;
  document.querySelector(".iconConnect").click();
  document.querySelector("#idNoteInput").value = id;
  titleTagConnect.value = title;
  descTagConnect.value = replaceAllStart(descFilter);
  couleurs.forEach((couleurSpan) => {
    couleurSpan.classList.contains(couleur) ? couleurSpan.classList.add('selectionne') : couleurSpan.classList.remove('selectionne');
  });
  hidden == 0 ? document.getElementById("checkHidden").checked = false : document.getElementById("checkHidden").checked = true;
  descTagConnect.focus();
}

function copy(e) {
  const copyText = replaceAllStart(e),
    notification = document.getElementById("copyNotification");
  navigator.clipboard.writeText(copyText);
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

function deleteNoteConnect(e, f) {
  if (!window.location.pathname.endsWith('en.php')) {
    if (confirm(`Voulez-vous vraiment supprimer la note ${f} ?`)) {
      fetchDelete(e);
    }
  } else {
    if (confirm(`Do you really want to delete the note ${f}?`)) {
      fetchDelete(e);
    }
  }
}

function taskListEnablerExtension() {
  return [{
    type: 'output',
    regex: /<input type="checkbox"?/g,
    replace: '<input type="checkbox"'
  }];
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (document.activeElement.classList.contains("fa-clipboard")) {
      document.activeElement.click();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (document.activeElement.classList.contains("fa-trash-can")) {
      document.activeElement.click();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (document.activeElement.classList.contains("fa-pen")) {
      document.activeElement.click();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (document.activeElement.classList.contains("fa-expand")) {
      document.activeElement.click();
    }
  }
});

switchElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const checkbox = switchElement.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    switchElement.classList.toggle('checked');
  }
});

document.querySelectorAll(".iconConnect").forEach((element) => {
  element.addEventListener("click", () => {
    popupBoxConnect.classList.add("show");
    document.body.classList.add('noscroll');
    titleTagConnect.focus();
  });
  element.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
      element.click();
    }
  });
});

document.querySelectorAll(".sedeconnecter").forEach((element) => {
  element.addEventListener("click", () => {
    fetchLogout();
  });
  element.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
      fetchLogout();
    }
  });
});

document.querySelectorAll(".gestionCompte").forEach((element) => {
  element.addEventListener("click", () => {
    popupBoxGestion.classList.add("show");
    document.body.classList.add('noscroll');
    //focus le premier element focusable du popup
    popupBoxGestion.querySelector('i').focus();

  });
  element.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
      element.click();
    }
  });
});

document.querySelectorAll(".supprimerCompte").forEach((element) => {
  element.addEventListener("click", () => {
    if (!window.location.pathname.endsWith('en.php')) {
      if (confirm("Voulez-vous vraiment supprimer votre compte ainsi que toutes vos notes enregistrées dans le cloud ? Votre nom d'utilisateur redeviendra disponible pour les autres utilisateurs.")) {
        deleteAccount();
      }
    } else {
      if (confirm("Do you really want to delete your account and all your notes saved in the cloud? Your username will become available to other users again.")) {
        deleteAccount();
      }
    }
  });
  element.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
      if (!window.location.pathname.endsWith('en.php')) {
        if (confirm("Voulez-vous vraiment supprimer votre compte ainsi que toutes vos notes enregistrées dans le cloud ? Votre nom d'utilisateur redeviendra disponible pour les autres utilisateurs.")) {
          deleteAccount();
        }
      } else {
        if (confirm("Do you really want to delete your account and all your notes saved in the cloud? Your username will become available to other users again.")) {
          deleteAccount();
        }
      }
    }
  });
});

document.querySelectorAll("form").forEach((element) => {
  element.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});

document.querySelectorAll("header i").forEach((element) => {
  element.addEventListener("click", () => {
    isUpdate = false;
    document.querySelectorAll("form").forEach(form => form.reset());
    popupBoxConnect.classList.remove("show");
    popupBoxGestion.classList.remove("show");
    darken.classList.remove("show");
    document.body.classList.remove('noscroll');
  });
  element.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
      element.click();
    }
  });
});

document.querySelector("#search-input").addEventListener("keyup", () => {
  const e = document.querySelector("#search-input").value.trim().toLowerCase();
  document.querySelectorAll(".note").forEach((element) => {
    const t = element.querySelector(".note p").innerText.toLowerCase();
    t.includes(e) ? element.style.display = "flex" : element.style.display = "none";
  });
});

document.addEventListener("keydown", e => {
  e.ctrlKey && "k" === e.key && (e.preventDefault(),
    document.querySelector('#search-input').focus())
});

document.querySelector("#tri").addEventListener("change", async () => {
  fetch("/projets/notes/assets/php/sort.php", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "tri=" + document.querySelector("#tri").value
  })
    .then(response => {
      if (response.ok) {
        document.querySelectorAll(".note").forEach((note) => {
          note.remove();
        });
        showNotesConnect();
      }
    })
});

couleurs.forEach((couleurSpan, index) => {
  couleurSpan.addEventListener('click', (event) => {
    couleurs.forEach((couleurSpan) => {
      couleurSpan.classList.remove('selectionne');
    });
    event.target.classList.add('selectionne');
  });
  couleurSpan.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
      couleurSpan.click();
    }
  });
  if (index === 0) {
    couleurSpan.classList.add('selectionne');
  }
});

document.querySelector("#submitNoteConnect").addEventListener("click", async () => {
  const titreBrut = document.querySelector("#titleConnect").value.trim(),
    contentBrut = document.querySelector("#descConnect").value;
  if (!titreBrut || !contentBrut || contentBrut.length > 2000) {
    return;
  }
  const titre = encodeURIComponent(titreBrut.replaceAll(/'/g, "‘").replaceAll(/\\/g, "/")),
    content = encodeURIComponent(contentBrut.replaceAll(/'/g, "‘").replaceAll(/\\/g, "/")),
    couleurSpan = document.querySelector('.couleurs span.selectionne'),
    couleur = couleurSpan.classList[0],
    date = new Date().toISOString().slice(0, 19).replace('T', ' '),
    checkBox = document.getElementById("checkHidden");
  let hidden;
  checkBox.checked ? hidden = 1 : hidden = 0;
  const url = isUpdate ? "/projets/notes/assets/php/updateNote.php" : "/projets/notes/assets/php/formAddNote.php",
    data = isUpdate ? `noteId=${document.querySelector("#idNoteInput").value}&title=${titre}&filterDesc=${content}&couleur=${couleur}&date=${date}&hidden=${hidden}` : `titleConnect=${titre}&descriptionConnect=${content}&couleurConnect=${couleur}&date=${date}&hidden=${hidden}`;
  fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: data
  })
    .then(response => {
      if (response.status === 200) {
        document.querySelectorAll(".note").forEach((note) => {
          note.remove();
        });
        isUpdate = false;
        popupBoxConnect.classList.remove("show");
        document.body.classList.remove('noscroll');
        document.querySelectorAll("form").forEach(form => form.reset());
        showNotesConnect();
      }
    })
});

document.querySelector("#submitChangeMDP").addEventListener("click", async () => {
  const e = document.querySelector("#mdpModifNew").value,
    t = document.querySelector("#mdpModifNewValid").value;
  if (!e || !t) {
    if (!window.location.pathname.endsWith('en.php')) {
      alert("Un ou plusieurs champs sont vides...");
      return;
    } else {
      alert("One or more fields are empty...");
      return;
    }
  }
  if (e.length < 6) {
    if (!window.location.pathname.endsWith('en.php')) {
      alert("Mot de passe trop faible (<6)...");
      return;
    } else {
      alert("Password too weak (<6)...");
      return;
    }
  }
  if (/^[0-9]+$/.test(e)) {
    if (!window.location.pathname.endsWith('en.php')) {
      alert("Mot de passe trop faible (que des chiffres)...");
      return;
    } else {
      alert("Password too weak (only numbers)...");
      return;
    }
  }
  if (/^[a-zA-Z]+$/.test(e)) {
    if (!window.location.pathname.endsWith('en.php')) {
      alert("Mot de passe trop faible (que des lettres)...");
      return;
    } else {
      alert("Password too weak (only letters)...");
      return;
    }
  }
  if (e !== t) {
    if (!window.location.pathname.endsWith('en.php')) {
      alert("Les mots de passe ne correspondent pas...");
      return;
    } else {
      alert("Passwords do not match...");
      return;
    }
  }
  const mdpNew = encodeURIComponent(e);
  fetch("/projets/notes/assets/php/formChangeMDP.php", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "mdpNew=" + mdpNew
  })
    .then(response => {
      if (response.status === 200) {
        if (!window.location.pathname.endsWith('en.php')) {
          alert("Mot de passe modifié !");
        } else {
          alert("Password changed!");
        }
        popupBoxGestion.classList.remove("show");
        document.body.classList.remove('noscroll');
        document.querySelectorAll("form").forEach(form => form.reset());
      }
    })
});

document.addEventListener("DOMContentLoaded", () => {
  showNotesConnect();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/projets/notes/sw.js");
  }
});
