import request from '../../utils/request'
import { ENDPOINTS } from '../config'

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @returns {Promise}
 */
export const login = (data) => {
  return request.post(ENDPOINTS.AUTH.LOGIN, data)
}

/**
 * 用户注册
 * @param {Object} data 注册数据
 * @param {string} data.username 用户名
 * @param {string} data.email 邮箱
 * @param {string} data.password 密码
 * @returns {Promise}
 */
export const register = (data) => {
  return request.post(ENDPOINTS.AUTH.REGISTER, data)
}

/**
 * 用户登出
 * @returns {Promise}
 */
export const logout = () => {
  return request.post(ENDPOINTS.AUTH.LOGOUT)
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export const getUserInfo = () => {
  return request.get(ENDPOINTS.USER.GET_INFO)
}

/**
 * 更新用户信息
 * @param {Object} data 用户信息
 * @returns {Promise}
 */
export const updateUserInfo = (data) => {
  return request.put(ENDPOINTS.USER.UPDATE_INFO, data)
}

/**
 * 更改密码
 * @param {Object} data 密码数据
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.newPassword 新密码
 * @returns {Promise}
 */
export const changePassword = (data) => {
  return request.put(ENDPOINTS.USER.CHANGE_PASSWORD, data)
}

/**
 * 获取用户统计信息
 * @returns {Promise}
 */
export const getUserStatistics = () => {
  return request.get(ENDPOINTS.USER.GET_STATISTICS)
}

/**
 * 获取用户关注列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getUserFollows = (params = {}) => {
  return request.get(ENDPOINTS.USER.GET_FOLLOWS, { params })
}

/**
 * 获取用户粉丝列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getUserFollowers = (params = {}) => {
  return request.get(ENDPOINTS.USER.GET_FOLLOWERS, { params })
}

/**
 * 关注用户
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const followUser = (userId) => {
  return request.post(ENDPOINTS.USER.FOLLOW(userId))
}

/**
 * 取消关注用户
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const unfollowUser = (userId) => {
  return request.post(ENDPOINTS.USER.UNFOLLOW(userId))
}