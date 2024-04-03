import { Question, ElementFactory, Serializer } from "survey-core";

export const CUSTOM_TYPE = "map";

export class MapQuestionModel extends Question {
    override getType() {
        return CUSTOM_TYPE;
    }

    get bounds() {
        return this.getPropertyValue("bounds");
    }
    set bounds(val) {
        this.setPropertyValue("bounds", val);
    }

    get interactive() {
        return this.getPropertyValue("interactive");
    }
    set interactive(val) {
        this.setPropertyValue("interactive", val);
    }
}

ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new MapQuestionModel(name);
});

Serializer.addClass(
    CUSTOM_TYPE,
    [
        {
            name: "bounds",
        },
        {
            name: "interactive",
        },
    ],
    function () {
        return new MapQuestionModel("");
    },
    "question"
);