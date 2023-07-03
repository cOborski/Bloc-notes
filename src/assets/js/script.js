/* eslint-disable no-alert */
let isUpdate;
let errorMessage;
let touchStart = 0;
let touchEnd = 0;
let timeoutCopy;
let timeoutError;
const notesContainer = document.querySelector('main');
const popupBox = document.querySelector('.popup-box');
const connectBox = document.querySelector('.connect-box');
const creerBox = document.querySelector('.creer-box');
const titleTag = popupBox.querySelector('#title');
const descTag = popupBox.querySelector('#content');
const couleurs = document.querySelectorAll('.couleurs span');
const darken = document.querySelector('.darken');
const switchElement = document.querySelector('.switch');
const forms = document.querySelectorAll('form');
const cookie = document.querySelector('#cookie');
const sideBarMobile = document.querySelector('.sideBarMobile');
const notesJSON = JSON.parse(localStorage.getItem('local_notes') || '[]');

const replaceAllStart = (e) => e.replaceAll('<br /><br />', '\n\n').replaceAll('<br />', '\n');

const replaceAllEnd = (e) => e.replaceAll('\n\n', '<br /><br />').replaceAll('\n', '<br />');

const showError = (message) => {
  if (timeoutError) clearTimeout(timeoutError);
  const notification = document.querySelector('#errorNotification');
  notification.textContent = message;
  notification.style.display = 'block';
  timeoutError = setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
};

const taskListEnablerExtension = () => [{
  type: 'output',
  regex: /<input type="checkbox"?/g,
  replace: '<input type="checkbox"',
}];

const searchSideBar = () => {
  document.querySelectorAll('.listNotes p').forEach((element) => {
    element.addEventListener('click', () => {
      const e = element.querySelector('.titleList').textContent;
      document.querySelectorAll('.note').forEach((note) => {
        const t = note.querySelector('.note h2').textContent;
        if (t === e) {
          note.scrollIntoView();
          note.focus();
        }
      });
    });
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') element.click();
    });
  });
};

// eslint-disable-next-line no-undef
const converter = new showdown.Converter({
  tasklists: true,
  smoothLivePreview: true,
  extensions: [taskListEnablerExtension],
});

const showNotes = async () => {
  document.querySelector('.sideBar .listNotes').textContent = '';
  document.querySelector('.sideBarMobile .listNotes').textContent = '';

  const notes = document.querySelectorAll('.note');
  notes.forEach((note) => note.remove());

  if (notesJSON.length === 0) {
    document.querySelector('.sideBar h2').textContent = 'Notes (0)';
    document.querySelector('.sideBarMobile h2').textContent = 'Notes (0)';
    return;
  }

  notesJSON
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((e, id) => {
      const {
        couleur, hidden, title, description, date,
      } = e;

      const descEnd = replaceAllEnd(e.description);
      const descHtml = converter.makeHtml(description);

      const noteElement = document.createElement('div');
      noteElement.id = `note${id}`;
      noteElement.classList.add('note', couleur);
      noteElement.tabIndex = 0;

      const detailsElement = document.createElement('div');
      detailsElement.classList.add('details');

      const titleElement = document.createElement('h2');
      titleElement.classList.add('title');
      titleElement.innerHTML = title;

      const descElement = document.createElement('span');
      if (hidden === false) {
        descElement.innerHTML = descHtml;
      } else {
        descElement.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      }

      detailsElement.appendChild(titleElement);
      detailsElement.appendChild(descElement);

      const bottomContentElement = document.createElement('div');
      bottomContentElement.classList.add('bottom-content');

      const dateElement = document.createElement('span');
      dateElement.textContent = date;

      const editIconElement = document.createElement('i');
      editIconElement.classList.add('fa-solid', 'fa-pen', 'note-action');
      editIconElement.tabIndex = 0;
      editIconElement.setAttribute('data-note-id', id);
      editIconElement.setAttribute('data-note-title', title);
      editIconElement.setAttribute('data-note-desc', descEnd);
      editIconElement.setAttribute('data-note-color', couleur);
      editIconElement.setAttribute('data-note-hidden', hidden);
      editIconElement.setAttribute('role', 'button');

      const trashIconElement = document.createElement('i');
      trashIconElement.classList.add('fa-solid', 'fa-trash-can', 'note-action');
      trashIconElement.tabIndex = 0;
      trashIconElement.setAttribute('data-note-id', id);
      trashIconElement.setAttribute('role', 'button');

      bottomContentElement.appendChild(dateElement);
      bottomContentElement.appendChild(editIconElement);
      bottomContentElement.appendChild(trashIconElement);

      if (hidden === false) {
        const clipboardIconElement = document.createElement('i');
        clipboardIconElement.classList.add('fa-solid', 'fa-clipboard', 'note-action');
        clipboardIconElement.tabIndex = 0;
        clipboardIconElement.setAttribute('data-note-desc', descEnd);
        clipboardIconElement.setAttribute('role', 'button');
        bottomContentElement.appendChild(clipboardIconElement);

        const expandIconElement = document.createElement('i');
        expandIconElement.classList.add('fa-solid', 'fa-expand', 'note-action');
        expandIconElement.tabIndex = 0;
        expandIconElement.setAttribute('data-note-id', id);
        expandIconElement.setAttribute('role', 'button');
        bottomContentElement.appendChild(expandIconElement);
      }

      noteElement.appendChild(detailsElement);
      noteElement.appendChild(bottomContentElement);
      notesContainer.appendChild(noteElement);

      document.querySelector('.sideBar .listNotes').innerHTML += `<p tabindex="0" role="button"><span class="titleList">${title}</span><span class="dateList">${date}</span></p>`;
      document.querySelector('.sideBarMobile .listNotes').innerHTML += `<p tabindex="0" role="button"><span class="titleList">${title}</span><span class="dateList">${date}</span></p>`;
    });
  document.querySelector('.sideBar h2').textContent = `Notes (${notesJSON.length})`;
  document.querySelector('.sideBarMobile h2').textContent = `Notes (${notesJSON.length})`;
  searchSideBar();
};

const toggleFullscreen = (id) => {
  const note = document.querySelector(`#note${id}`);
  note.classList.toggle('fullscreen');
  darken.classList.toggle('show');
  document.body.classList.toggle('noscroll');
};

const updateNote = (id, title, desc, couleur, hidden) => {
  const s = replaceAllStart(desc);
  document.querySelectorAll('.note').forEach((note) => {
    note.classList.remove('fullscreen');
  });
  darken.classList.remove('show');
  document.body.classList.add('noscroll');
  document.querySelector('#idNoteInput').value = id;
  isUpdate = true;
  document.querySelector('.icon').click();
  titleTag.value = title;
  descTag.value = s;
  couleurs.forEach((couleurSpan) => {
    if (couleurSpan.classList.contains(couleur)) {
      couleurSpan.classList.add('selectionne');
    } else {
      couleurSpan.classList.remove('selectionne');
    }
  });
  if (hidden === 'true') { document.querySelector('#checkHidden').checked = true; }
  descTag.focus();
};

const copy = (e) => {
  if (timeoutCopy) clearTimeout(timeoutCopy);
  const copyText = replaceAllStart(e);
  const notification = document.querySelector('#copyNotification');
  navigator.clipboard.writeText(copyText);
  notification.style.display = 'block';
  timeoutCopy = setTimeout(() => {
    notification.style.display = 'none';
  }, 2000);
};

const deleteNote = (e) => {
  const confirmationMessage = window.location.pathname.endsWith('en/') ? 'Do you really want to delete this note?' : 'Voulez-vous vraiment supprimer cette note ?';
  if (window.confirm(confirmationMessage)) {
    notesJSON.splice(e, 1);
    localStorage.setItem('local_notes', JSON.stringify(notesJSON));
    darken.classList.remove('show');
    showNotes();
  }
};

notesContainer.addEventListener('click', (event) => {
  const { target } = event;
  if (target.classList.contains('note-action')) {
    const noteId = target.getAttribute('data-note-id');
    const noteTitle = target.getAttribute('data-note-title');
    const noteDesc = target.getAttribute('data-note-desc');
    const noteColor = target.getAttribute('data-note-color');
    const noteHidden = target.getAttribute('data-note-hidden');

    if (target.classList.contains('fa-pen')) {
      updateNote(noteId, noteTitle, noteDesc, noteColor, noteHidden);
    } else if (target.classList.contains('fa-clipboard')) {
      copy(noteDesc);
    } else if (target.classList.contains('fa-trash-can')) {
      deleteNote(noteId);
    } else if (target.classList.contains('fa-expand')) {
      toggleFullscreen(noteId);
    }
  }
});

document.querySelector('#cookieButton').addEventListener('click', () => {
  cookie.style.display = 'none';
  localStorage.setItem('cookie', 'hide');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (document.activeElement.classList.contains('fa-clipboard')) {
      document.activeElement.click();
    } else if (document.activeElement.classList.contains('fa-trash-can')) {
      document.activeElement.click();
    } else if (document.activeElement.classList.contains('fa-pen')) {
      document.activeElement.click();
    } else if (document.activeElement.classList.contains('fa-expand')) {
      document.activeElement.click();
    }
  } else if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    document.querySelector('#search-input').focus();
  }
});

document.querySelectorAll('.seconnecter').forEach((element) => {
  element.addEventListener('click', () => {
    connectBox.classList.add('show');
    document.body.classList.add('noscroll');
    document.querySelector('#nomConnect').focus();
  });
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') element.click();
  });
});

switchElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const checkbox = switchElement.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    switchElement.classList.toggle('checked');
  }
});

document.querySelectorAll('.creercompte').forEach((element) => {
  element.addEventListener('click', () => {
    connectBox.classList.remove('show');
    creerBox.classList.add('show');
    document.body.classList.add('noscroll');
    document.querySelector('#nomCreer').focus();
  });
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') element.click();
  });
});

document.querySelector('#submitCreer').addEventListener('click', async () => {
  const e = document.querySelector('#nomCreer').value.trim();
  const t = document.querySelector('#mdpCreer').value;
  const o = document.querySelector('#mdpCreerValid').value;
  if (!e || !t || !o) return;
  if (!/^[a-zA-ZÀ-ÿ -]+$/.test(e)) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Le nom ne peut contenir que des lettres...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'The name can only contain letters...';
    showError(errorMessage);
    return;
  }
  if (e.length < 4) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Nom trop court (<4)...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'Name too short (<4)...';
    showError(errorMessage);
    return;
  }
  if (e.length > 25) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Nom trop long (>25)...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'Name too long (>25)...';
    showError(errorMessage);
    return;
  }
  if (t.length < 6) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Mot de passe trop faible (<6)...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'Password too weak (<6)...';
    showError(errorMessage);
    return;
  }
  if (/^[0-9]+$/.test(t)) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Le mot de passe ne peut pas contenir que des chiffres...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'Password too weak (only numbers)...';
    showError(errorMessage);
    return;
  }
  if (/^[a-zA-Z]+$/.test(t)) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Le mot de passe ne peut pas contenir que des lettres...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'Password too weak (only letters)...';
    showError(errorMessage);
    return;
  }
  if (t !== o) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Les mots de passe ne correspondent pas...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'Passwords do not match...';
    showError(errorMessage);
    return;
  }
  if (e === t) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Le mot de passe doit être différent du nom...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'The password must be different from the username...';
    showError(errorMessage);
    return;
  }
  const nomCreer = encodeURIComponent(e);
  const mdpCreer = encodeURIComponent(t);
  try {
    const response = await fetch('/projets/notes/assets/php/formCreer.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `nomCreer=${nomCreer}&mdpCreer=${mdpCreer}&csrf_token_creer=${document.querySelector('#csrf_token_creer').value}`,
    });
    if (response.ok) {
      creerBox.classList.remove('show');
      document.body.classList.remove('noscroll');
      forms.forEach((form) => form.reset());
      if (!window.location.pathname.endsWith('en/')) {
        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        return;
      }
      alert('Account created successfully! You can now log in.');
      return;
    }
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Utilisateur déjà existant...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'User already exists...';
    showError(errorMessage);
  } catch (error) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Une erreur est survenue lors de la création du compte...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'An error occurred while creating the account...';
    showError(errorMessage);
  }
});

document.querySelector('#submitSeConnecter').addEventListener('click', async () => {
  const e = document.querySelector('#nomConnect').value.trim();
  const t = document.querySelector('#mdpConnect').value;
  if (!e || !t) return;
  if (!/^[a-zA-ZÀ-ÿ -]+$/.test(e)) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Le nom ne peut contenir que des lettres...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'The name can only contain letters...';
    showError(errorMessage);
    return;
  }
  const nomConnect = encodeURIComponent(e);
  const mdpConnect = encodeURIComponent(t);
  try {
    const response = await fetch('/projets/notes/assets/php/formConnect.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `nomConnect=${nomConnect}&mdpConnect=${mdpConnect}&csrf_token_connect=${document.querySelector('#csrf_token_connect').value}`,
    });
    const data = await response.json();
    if (data.success) {
      window.location.reload();
    } else {
      document.querySelector('#mdpConnect').value = '';
      let time = 10;
      const button = document.querySelector('#submitSeConnecter');
      button.disabled = true;
      if (!window.location.pathname.endsWith('en/')) {
        errorMessage = 'Mauvais identifiants...';
        showError(errorMessage);
        const interval = setInterval(() => {
          time -= 1;
          button.textContent = `Se connecter (${time})`;
        }, 1000);
        setTimeout(() => {
          clearInterval(interval);
          button.disabled = false;
          button.textContent = 'Se connecter';
        }, 11000);
        return;
      }
      errorMessage = 'Wrong credentials...';
      showError(errorMessage);
      const interval = setInterval(() => {
        time -= 1;
        button.textContent = `Sign in (${time})`;
      }, 1000);
      setTimeout(() => {
        clearInterval(interval);
        button.disabled = false;
        button.textContent = 'Sign in';
      }, 11000);
    }
  } catch (error) {
    if (!window.location.pathname.endsWith('en/')) {
      errorMessage = 'Une erreur est survenue lors de la connexion...';
      showError(errorMessage);
      return;
    }
    errorMessage = 'An error occurred while logging in...';
    showError(errorMessage);
  }
});

document.querySelectorAll('.icon').forEach((element) => {
  element.addEventListener('click', () => {
    popupBox.classList.add('show');
    document.body.classList.add('noscroll');
    document.querySelector('#title').focus();
  });
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') element.click();
  });
});

couleurs.forEach((span, index) => {
  span.addEventListener('click', (event) => {
    couleurs.forEach((s) => {
      s.classList.remove('selectionne');
    });
    event.target.classList.add('selectionne');
  });
  span.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') span.click();
  });
  if (index === 0) span.classList.add('selectionne');
});

document.querySelector('#submitNote').addEventListener('click', () => {
  const couleurSpan = document.querySelector('.couleurs span.selectionne');
  const v = couleurSpan.classList[0];
  const e = titleTag.value.trim()
    .replaceAll(/'/g, '‘')
    .replaceAll(/"/g, '‘‘')
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;');
  const t = descTag.value.trim()
    .replaceAll(/'/g, '‘')
    .replaceAll(/"/g, '‘‘')
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;');
  const g = document.querySelector('#checkHidden').checked;
  if (!e || !t || t.length > 2000) return;
  const c = {
    couleur: v,
    title: e,
    description: t,
    date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    hidden: g,
  };
  if (isUpdate) {
    isUpdate = false;
    notesJSON[document.querySelector('#idNoteInput').value] = c;
  } else {
    notesJSON.push(c);
  }
  localStorage.setItem('local_notes', JSON.stringify(notesJSON));
  forms.forEach((form) => form.reset());
  popupBox.classList.remove('show');
  document.body.classList.remove('noscroll');
  showNotes();
});

document.querySelectorAll('#menuIcon').forEach((element) => {
  element.addEventListener('click', () => {
    document.querySelector('.sideBarMobile').classList.add('show');
    darken.classList.toggle('show');
  });
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      element.click();
      document.querySelector('.sideBarMobile header i').focus();
    }
  });
});

document.body.addEventListener('touchstart', (e) => {
  touchStart = e.targetTouches[0].clientX;
});

document.body.addEventListener('touchmove', (e) => {
  touchEnd = e.targetTouches[0].clientX;
});

document.body.addEventListener('touchend', () => {
  const swipeDistance = touchEnd - touchStart;
  if (swipeDistance > 50 && !sideBarMobile.classList.contains('show')) {
    sideBarMobile.classList.add('show');
    darken.classList.add('show');
    document.querySelectorAll('.note').forEach((note) => {
      note.classList.remove('fullscreen');
    });
    document.body.classList.add('noscroll');
  } else if (swipeDistance < -50 && sideBarMobile.classList.contains('show')) {
    sideBarMobile.classList.remove('show');
    darken.classList.remove('show');
    document.querySelectorAll('.note').forEach((note) => {
      note.classList.remove('fullscreen');
    });
    document.body.classList.add('noscroll');
  }
  touchStart = 0;
  touchEnd = 0;
});

sideBarMobile.addEventListener('touchstart', (e) => {
  e.stopPropagation();
});

forms.forEach((element) => {
  element.addEventListener('submit', (event) => {
    event.preventDefault();
  });
});

document.querySelectorAll('header i').forEach((element) => {
  element.addEventListener('click', () => {
    isUpdate = false;
    forms.forEach((form) => form.reset());
    popupBox.classList.remove('show');
    connectBox.classList.remove('show');
    creerBox.classList.remove('show');
    darken.classList.remove('show');
    document.body.classList.remove('noscroll');
    document.querySelector('.sideBarMobile').classList.remove('show');
  });
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') element.click();
  });
});

document.querySelector('#search-input').addEventListener('keyup', () => {
  const e = document.querySelector('#search-input').value.trim().toLowerCase();
  document.querySelectorAll('.note').forEach((element) => {
    const note = element;
    const t = note.querySelector('.note h2').textContent.toLowerCase();
    if (t.includes(e)) {
      note.style.display = 'flex';
    } else {
      note.style.display = 'none';
    }
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  if ('serviceWorker' in navigator) await navigator.serviceWorker.register('/projets/notes/sw.js');
  if (localStorage.getItem('cookie') !== 'hide') cookie.style.display = 'block';
  await showNotes();
});
