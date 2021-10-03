module.exports = (DISCORD, client, rolesConfig) => {
    const usersRolesMap = new Map();

    client.on('ready', () => {
        const rolesChannel = client.channels.cache.get(rolesConfig.channel);
        rolesConfig.roles.forEach(role => {
            var rowArray = [
            new DISCORD.MessageActionRow().addComponents(
                new DISCORD.MessageSelectMenu()
                .setCustomId(role.id)
                .setPlaceholder(role.placeholder)
                .addOptions(role.options)
            )];
            if(role.id.split('-')[0] === 'multiple') {
                var buttons = new DISCORD.MessageActionRow()
                role.buttons.forEach(button => {
                    buttons.addComponents(
                        new DISCORD.MessageButton()
                        .setCustomId(button.id)
                        .setLabel(button.label)
                        .setStyle(button.style)
                    )    
                });
                rowArray.push(buttons);
            }
            rolesChannel.send({ content: role.banner, components: rowArray});
        });
    });
    
    client.on('interactionCreate', interaction => {
        if(!interaction.isSelectMenu()) return;
        rolesConfig.roles.forEach(menu => {
            if(menu.id === interaction.customId && interaction.customId.split('-')[1] === 'role') {
                if(interaction.customId.split('-')[0] === 'unique') {
                    menu.roles.forEach(role => {
                        if(interaction.member.roles.cache.get(role)) {
                            interaction.member.roles.remove(role);
                        }
                    });
                    interaction.member.roles.add(interaction.values[0]);
                    interaction.reply({ content: "Tes roles ont bien été changés", ephemeral: true });
                } else {
                    if(usersRolesMap.get(interaction.user.tag)) {
                        var content = usersRolesMap.get(interaction.user.tag);
                        content.push({
                            menuId: interaction.customId,
                            values: interaction.values,
                            roles: menu.roles
                        });
                        usersRolesMap.set(interaction.user.tag, content);
                    } else {
                        usersRolesMap.set(interaction.user.tag, [{
                            menuId: interaction.customId,
                            values: interaction.values,
                            roles: menu.roles
                        }]);
                    }
                    interaction.reply({ content: "Le role est selectionné, tu n'a plus plus qu'a appliquer les changements", ephemeral: true });
                }
            }
        });
    });
    
    client.on('interactionCreate', interaction => {
        if(!interaction.isButton()) return;
        if(interaction.customId.split('-')[0] === 'role') {
            if(usersRolesMap.get(interaction.user.tag)) {
                const data = usersRolesMap.get(interaction.user.tag);
                data.forEach(dataSelected => {
                    if(interaction.customId.split('-')[1] === dataSelected.menuId.split('-')[2]) {
                        var arrayCounter = {
                            eneable: true,
                            counter: 0
                        };
                        dataSelected.roles.forEach(role => {
                            if(arrayCounter.eneable) arrayCounter.counter++;
                            if(interaction.member.roles.cache.get(role)) {
                                arrayCounter.eneable = false;
                            }
                        });
                        if(interaction.customId.split('-')[2] === 'add') {
                            interaction.member.roles.add(dataSelected.values[0]);
                        } else {
                            interaction.member.roles.remove(dataSelected.values[0]);
                        }
                        usersRolesMap.set(interaction.user.tag, usersRolesMap.get(interaction.user.tag).slice(arrayCounter.counter, arrayCounter.counter));
                        interaction.reply({ content: "Tes roles ont bien été changés", ephemeral: true });
                    }
                });
            } else {
                interaction.reply({ content: "Aucun changement !", ephemeral: true });
            }
        }
    });
}
