'use strict'

module.exports = function setupAgent (AgentModel) {
    const findById = id =>  AgentModel.findByPk(id)

    const createOrUpdate = async agent => {
        const condition = {
            where: {
                uuid: agent.uuid
            }
        }

        const existingAgent = await AgentModel.findOne(condition)

        if (existingAgent) {
            const updatedAgent = await AgentModel.update(agent, condition)
            return updatedAgent ? AgentModel.findOne(condition) : existingAgent
        }

        const result = await AgentModel.create(agent)
        return result.toJSON()
    }

    const findByUuid = uuid => {
        return AgentModel.findOne({
            where: {
                uuid
            }
        })
    }

    const findAll = () => AgentModel.findAll()

    const findConnected = () => {
        return AgentModel.findAll({
            where: {
                connected: true
            }
        })
    }

    const findByUsername = username => {
        return AgentModel.findAll({
            where: {
                username,
                connected: true
            }
        })
    }

    return {
        findById,
        createOrUpdate,
        findByUuid,
        findAll,
        findConnected,
        findByUsername
    }
}