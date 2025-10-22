import listItem from "../models/ListItem.js";

export async function getitems(req, res){
    try {
        const item = await listItem.find({ userId: req.user.id });
        res.status(200).json({ items: item });
    } catch (err) {
        res.status(500).send({ message: "Server Error" + err.message });
    }
}

export async function getItem(req, res){
    try {
        const item = await listItem.findOne({ id: req.params.id, userId: req.user.id });
        if (!item) {
        return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ item: item });
    } catch (err) {
        res.status(500).json({ message: "Server Error" + err.message });
    }
}

export async function createItem(req, res){
    const item = new listItem({
        userId: req.user.id,
        sector: req.body.sector,
        name: req.body.name,
        unit: req.body.unit,
        quantity: req.body.quantity,
        price: req.body.price,
        brand: req.body.brand === "" ? "Sin Especificar" : req.body.brand
    });

    try {
        const newItem = await item.save();
        res.status(201).json({ item: newItem });
    } catch (err) {
        res.status(500).json({ message: "Server Error " + err.message });
    }
}

export async function editItem(req, res){
    const updates = req.body;
    try {
    const item = await listItem.findOneAndUpdate(
        { id: req.params.id, userId: req.user.id }, 
        updates, 
        {new: true}
    );
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ item: item });
    } catch (err) {
    res.status(500).json({ message: "Server Error " + err.message });
    }
}

export async function deleteItem(req, res){
    try {
        const item = await listItem.findOneAndDelete({ id: req.params.id, userId: req.user.id });
        if (!item) {
        return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ item: item });
    } catch (err) {
        res.status(500).json({ message: "Server Error" + err.message });
    }
}