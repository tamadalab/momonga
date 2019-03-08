const loadItems = () => {
  $.ajax({
    type: "GET",
    url: '/api/likes',
    success: (data) => {
      data.forEach((item) => {
        $('#list').append(`<li>${item.key} ${likes(item.key, item.count)}</li>`)
      })
    }
  })
}

const showError = (message) => {
  $('#message').html(`<p class="error">${message}</p>`)
  $('#key').css('background-color', 'red')
}

const clear = () => {
  $('#message').html('')
  $('#key').css('background-color', 'white')
}

const likes = (key, count) => {
  if(!count) count = 0
  return `<a onclick="postLike('${key}')">いいね</a> (<span id="count-${key}">${count}</span>)`
}

const updateLikes = () => {
  $.ajax({
    type: "GET",
    url: '/api/likes',
    success: (data) => {
      data.forEach((item) => {
        $(`#count-${item.key}`).html(item.count)
      })
    }
  })
}

const postLike = (key) => {
  $.post(`/api/likes/${key}`, (data, status, xhr) => {
    $(`#count-${key}`).html(data.count)
  })
}

const register = (key) => {
  console.log(`before append`)
  $('#list').append(`<li>${key} ${likes(key)} </li>`)
  console.log(`after append`)
  postLike(key)
  // updateLikes()
}

const performIfNoError = (key) => {
  if(!key) return true
  $('#key').html('')

  $.ajax({
    type: 'GET',
    url: `/api/likes/${key}`
  }).done((data, status, xhr) => {
    if(data.count != 0){
      showError(`${key} was already registered`)
    } else{
      register(key)
    }
  })
  $('#key').val('')
}

const addKey = () => {
    const key = $('#key').val()
    console.log(`push 'Add key' button with key: ${key}`)
    if(performIfNoError(key)){
        showError('input key value')
    }
    clear()
    return false
}

const download = (path) => {
    return $.post(`/api/downloads/${path}`)
}

loadItems()
