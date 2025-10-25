import pendingList from "../models/PendingList.js";

export async function getitems(req, res){
    try {
        const item = await pendingList.find({ userId: req.user.id });
        res.status(200).json({ items: item });
    } catch (err) {
        res.status(500).send({ message: "Server Error" + err.message });
    }
}

export async function getItem(req, res){
    try {
        const item = await pendingList.findOne({ productId: req.params.id, userId: req.user.id });
        if (!item) {
        return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ item: item });
    } catch (err) {
        res.status(500).json({ message: "Server Error " + err.message });
    }
}

export async function createItem(req, res){
    
    const item = new pendingList({
        userId: req.user.id,
        productId: req.body.productId,
        sector: req.body.sector,
        name: req.body.name,
        unit: req.body.unit,
        quantity: req.body.quantity,
        price: req.body.price,
        brand: req.body.brand,
    });

    try {
        const newItem = await item.save();
        res.status(201).json({ item: newItem });
    } catch (err) {
        res.status(500).json({ message: "Server Error " + err.message });
    }
}

export async function deleteItem(req, res){
    try {
        const item = await pendingList.findOneAndDelete({ productId: req.params.id, userId: req.user.id });
        if (!item) {
        return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ item: item });
    } catch (err) {
        res.status(500).json({ message: "Server Error" + err.message });
    }
}