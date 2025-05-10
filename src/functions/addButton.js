/**
 * Cria um componente de botão e o adiciona à linha de componentes especificada.
 * @param {import("..").Data} d - O objeto de dados fornecido pelo framework AOI.
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);

    // Verifica se data.inside existe e é uma string
    if (!data.inside || typeof data.inside !== "string") {
        return d.aoiError.fnError(
            d,
            "custom",
            { inside: data.inside },
            `Argumentos Inválidos. Esperava-se uma string com argumentos separados por ';'. Recebido: ${JSON.stringify(data.inside)}`
        );
    }

    // Parseia os parâmetros usando split(";")
    const params = data.inside.split(";").map(param => param.trim());
    
    // Verifica se há pelo menos 4 parâmetros (index, label, style, custom)
    if (params.length < 4) {
        return d.aoiError.fnError(
            d,
            "custom",
            { inside: data.inside },
            `Número insuficiente de argumentos. Esperados pelo menos 4 (índice;label;estilo;custom). Recebidos: ${params.length}`
        );
    }

    const [index, label, style, custom, disabled = "false", emoji] = params;

    // Valida o índice
    if (!index || isNaN(index) || Number(index) < 1) {
        return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Índice Inválido Fornecido");
    }
    const rowIndex = Number(index) - 1;

    // Valida e converte o estilo
    let buttonStyle;
    if (isNaN(style)) {
        buttonStyle = d.util.constants.ButtonStyleOptions[style.toLowerCase()];
    } else {
        buttonStyle = Number(style);
    }
    
    if (buttonStyle === undefined || buttonStyle < 1 || buttonStyle > 6) {
        return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Estilo Inválido Fornecido");
    }

    // Parseia a flag de desativado
    const isDisabled = disabled.toLowerCase() === "true";

    // Trata o emoji
    let emojiData;
    if (emoji) {
        emojiData = await d.util.getEmoji(d, emoji.addBrackets());
        emojiData = emojiData?.id || emoji?.addBrackets().trim();
    }

    // Cria o objeto do botão
    const button = {
        type: 2, // Tipo de componente de botão
        style: buttonStyle,
        label: label || undefined,
        disabled: isDisabled,
    };

    // Adiciona emoji se existir
    if (emojiData) {
        button.emoji = emojiData;
    }

    // Trata estilos específicos de botão
    if (buttonStyle === 5) { // Botão de URL
        if (!custom) {
            return d.aoiError.fnError(d, "custom", { inside: data.inside }, "URL Obrigatória para Botão de Link");
        }
        button.url = custom;
    } else if (buttonStyle === 6) { // Botão Premium
        delete button.label;
        delete button.emoji;
        button.sku_id = custom || "";
    } else { // Outros tipos de botão
        if (!custom) {
            return d.aoiError.fnError(d, "custom", { inside: data.inside }, "ID Personalizado Obrigatório para Botão Não-Link");
        }
        button.custom_id = custom; // Correção: custom_id em vez de customId
    }

    // Inicializa o array de componentes se não existir
    if (!d.components) {
        d.components = [];
    }

    // Inicializa a linha de componentes se não existir
    if (!d.components[rowIndex]) {
        d.components[rowIndex] = { type: 1, components: [] };
    }

    // Verifica se não excedeu o limite de botões por linha (máximo 5)
    if (d.components[rowIndex].components.length >= 5) {
        return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Limite de 5 botões por linha excedido");
    }

    // Adiciona o botão à linha de componentes
    d.components[rowIndex].components.push(button);

    return {
        code: d.util.setCode(data)
    };
};
