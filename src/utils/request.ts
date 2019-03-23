import axios from 'axios'
import { URL } from 'url';

const API_BAIDU = 'https://sp1.baidu.com/5b11fzupBgM18t7jm9iCKT-xh_/sensearch/selecttext'

interface RequestOption {
  methods: string,
}

const SUCCESS_STATUS: string = 'OK'
const ERROR_MSG: string = '网络异常'

const fetch = (url: string, params: any = {}, options?: RequestOption): Promise<void> => {
  return axios
    .get(url)
    .then(({statusText, data}) => {
      console.log(data)
      if (statusText === SUCCESS_STATUS) {
        return data
      } else {
        console.log(statusText)
        return {
          error: ERROR_MSG
        }
      }
    })
    .catch(() => ({error: ERROR_MSG}))
}

export default fetch